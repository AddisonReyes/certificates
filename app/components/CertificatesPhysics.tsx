"use client";

import { useEffect, useRef, useState } from "react";
import type { Certificate } from "../../lib/certificates";

import type * as Matter from "matter-js";

type MatterNS = typeof import("matter-js");
type BodyWithCert = Matter.Body & { plugin?: { certificate?: Certificate } };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function CertificatesPhysics({
  certificates,
  onOpen,
}: {
  certificates: Certificate[];
  onOpen: (c: Certificate) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const onOpenRef = useRef(onOpen);
  const lastSizeRef = useRef<{ w: number; h: number } | null>(null);
  const imgSizeRef = useRef<Map<string, { nw: number; nh: number }>>(new Map());

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: null | (() => void) = null;
    let rebuildTimer: number | null = null;

    const loadImageSize = (src: string) => {
      const cached = imgSizeRef.current.get(src);
      if (cached) return Promise.resolve(cached);

      return new Promise<{ nw: number; nh: number }>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.onload = () => {
          const nw = img.naturalWidth || 800;
          const nh = img.naturalHeight || 600;
          const value = { nw, nh };
          imgSizeRef.current.set(src, value);
          resolve(value);
        };
        img.onerror = () => {
          const value = { nw: 800, nh: 600 };
          imgSizeRef.current.set(src, value);
          resolve(value);
        };
        img.src = src;
      });
    };

    const build = async () => {
      if (cancelled) return;
      const container = containerRef.current;
      if (!container) return;

      cleanup?.();
      cleanup = null;
      setReady(false);

      const Matter = (await import("matter-js")) as MatterNS;
      if (cancelled) return;

      const {
        Engine,
        Render,
        Runner,
        Bodies,
        Composite,
        Mouse,
        MouseConstraint,
        Query,
      } = Matter;

      const rect = container.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = clamp(Math.floor(rect.height), 520, 900);
      lastSizeRef.current = { w: width, h: height };

      container.innerHTML = "";

      const engine = Engine.create();
      engine.gravity.y = 1;

      const render = Render.create({
        element: container,
        engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent",
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        },
      });

      const runner = Runner.create();

      const wall = 120;
      const floor = Bodies.rectangle(width / 2, height + wall / 2, width + wall * 2, wall, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      });
      const left = Bodies.rectangle(-wall / 2, height / 2, wall, height + wall * 2, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      });
      const right = Bodies.rectangle(width + wall / 2, height / 2, wall, height + wall * 2, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      });
      Composite.add(engine.world, [floor, left, right]);

      // Card size scales with how many certificates are visible.
      // Fewer results => larger cards. More results => smaller cards.
      const n = Math.max(1, certificates.length);
      const columns = clamp(Math.ceil(Math.sqrt(n) * 1.25), 2, 11);
      const rawW = width / (columns + 0.75);
      const maxW = Math.min(380, Math.floor(width * 0.42));
      const cardW = clamp(Math.floor(rawW), 84, maxW);

      for (let i = 0; i < certificates.length; i++) {
        const c = certificates[i]!;
        const { nw, nh } = await loadImageSize(c.src);
        const aspect = nw / Math.max(1, nh);
        const cardH = Math.round(cardW / clamp(aspect, 1.15, 2.1));
        const x = clamp(
          Math.floor(Math.random() * width),
          Math.floor(cardW * 0.6),
          Math.floor(width - cardW * 0.6)
        );
        const y = -50 - i * 12;
        const angle = (Math.random() - 0.5) * 0.6;

        const body = Bodies.rectangle(x, y, cardW, cardH, {
          restitution: 0.15,
          friction: 0.2,
          frictionAir: 0.02,
          density: 0.002,
          angle,
          chamfer: { radius: Math.max(6, Math.floor(cardW * 0.05)) },
          render: {
            sprite: {
              texture: c.src,
              xScale: cardW / nw,
              yScale: cardH / nh,
            },
          },
        });
        (body as BodyWithCert).plugin = { certificate: c };
        Composite.add(engine.world, body);
      }

      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          damping: 0.1,
          render: { visible: false },
        },
      });
      Composite.add(engine.world, mouseConstraint);

      render.canvas.style.touchAction = "none";
      render.canvas.style.borderRadius = "16px";

      const toWorldPoint = (clientX: number, clientY: number) => {
        const r = render.canvas.getBoundingClientRect();
        const sx = width / Math.max(1, r.width);
        const sy = height / Math.max(1, r.height);
        return {
          x: (clientX - r.left) * sx,
          y: (clientY - r.top) * sy,
        };
      };

      const openAtClientPoint = (clientX: number, clientY: number) => {
        const point = toWorldPoint(clientX, clientY);
        const bodies = Composite.allBodies(engine.world);
        const hits = Query.point(bodies, point);
        const hit = hits.find((b) => (b as BodyWithCert).plugin?.certificate);
        if (!hit) return;
        const cert = (hit as BodyWithCert).plugin?.certificate ?? null;
        if (cert) onOpenRef.current(cert);
      };

      // Open on double click / double tap.
      // Note: Matter's MouseConstraint can start a drag on mousedown even without movement,
      // so relying on the browser's 'dblclick' event can be unreliable here.
      let lastTap: { t: number; x: number; y: number } | null = null;
      let down: { x: number; y: number } | null = null;
      const TAP_SLOP_PX = 8;
      const DBL_MS = 320;
      const DBL_SLOP_PX = 16;

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        down = { x: e.clientX, y: e.clientY };
      };
      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;

        const d = down;
        down = null;
        if (!d) return;

        const dx0 = e.clientX - d.x;
        const dy0 = e.clientY - d.y;
        if (dx0 * dx0 + dy0 * dy0 > TAP_SLOP_PX * TAP_SLOP_PX) {
          // Treat as drag/move; don't count towards double tap.
          lastTap = null;
          return;
        }

        const now = performance.now();
        const tap = { t: now, x: e.clientX, y: e.clientY };
        const prev = lastTap;
        lastTap = tap;

        if (!prev) return;
        if (now - prev.t > DBL_MS) return;

        const dx = tap.x - prev.x;
        const dy = tap.y - prev.y;
        if (dx * dx + dy * dy > DBL_SLOP_PX * DBL_SLOP_PX) return;

        openAtClientPoint(e.clientX, e.clientY);
        lastTap = null;
      };

      render.canvas.addEventListener("pointerdown", onPointerDown);
      render.canvas.addEventListener("pointerup", onPointerUp);

      Render.run(render);
      Runner.run(runner, engine);
      setReady(true);

      cleanup = () => {
        setReady(false);
        render.canvas.removeEventListener("pointerdown", onPointerDown);
        render.canvas.removeEventListener("pointerup", onPointerUp);
        Render.stop(render);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        render.canvas.remove();
      };
    };

    const scheduleRebuild = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = clamp(Math.floor(rect.height), 520, 900);

      const last = lastSizeRef.current;
      if (last && last.w === width && last.h === height) return;

      if (rebuildTimer != null) return;
      rebuildTimer = window.setTimeout(() => {
        rebuildTimer = null;
        build();
      }, 100);
    };

    build();
    const ro = new ResizeObserver(() => scheduleRebuild());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", scheduleRebuild);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", scheduleRebuild);
      ro.disconnect();
      if (rebuildTimer != null) window.clearTimeout(rebuildTimer);
      cleanup?.();
    };
  }, [certificates]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Drag with mouse or touch. Double-click/double-tap opens.
        </div>
        <div className="text-xs text-white/40">
          {ready ? "" : "Loading physics..."}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        style={{ height: "calc(100vh - 220px)", minHeight: 800, maxHeight: 1100 }}
      />
    </div>
  );
}
