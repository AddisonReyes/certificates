"use client";

import { useEffect, useRef, useState } from "react";
import type { Certificate } from "../../lib/certificates";

import type * as Matter from "matter-js";

type MatterNS = typeof import("matter-js");
type BodyWithCert = Matter.Body & {
  plugin?: { certificate?: Certificate; w?: number; h?: number };
};

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
  type TextureInfo = {
    nw: number;
    nh: number;
    ok: boolean;
    img: HTMLImageElement | null;
    promise?: Promise<TextureInfo>;
  };
  const textureRef = useRef<Map<string, TextureInfo>>(new Map());

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: null | (() => void) = null;
    let rebuildTimer: number | null = null;

    const preloadTexture = (src: string) => {
      const cached = textureRef.current.get(src);
      if (cached) return cached.promise ?? Promise.resolve(cached);

      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";

      const promise = new Promise<TextureInfo>((resolve) => {
        img.onload = () => {
          const value: TextureInfo = {
            nw: img.naturalWidth || 800,
            nh: img.naturalHeight || 600,
            ok: true,
            img,
          };
          textureRef.current.set(src, value);
          resolve(value);
        };
        img.onerror = () => {
          const value: TextureInfo = {
            nw: 800,
            nh: 600,
            ok: false,
            img: null,
          };
          textureRef.current.set(src, value);
          resolve(value);
        };
        img.src = src;
      });

      textureRef.current.set(src, {
        nw: 800,
        nh: 600,
        ok: false,
        img: null,
        promise,
      });

      return promise;
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
      // Big perf win with lots of bodies: let Matter put bodies to sleep.
      engine.enableSleeping = true;
      // Trade some accuracy for speed; tuned for a "pile of cards" feel.
      engine.positionIterations = 4;
      engine.velocityIterations = 3;
      engine.constraintIterations = 2;
      engine.gravity.y = 1;

      const render = Render.create({
        element: container,
        engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent",
          // Rendering 200+ sprites at high DPR is expensive; cap more aggressively.
          pixelRatio:
            certificates.length >= 160
              ? 1
              : Math.min(window.devicePixelRatio || 1, 2),
        },
      });

      // With 200+ sprites, drawing at 60fps is a common bottleneck (esp. Firefox).
      // Use a throttled loop so both physics + render run at a capped rate.
      const HEAVY = certificates.length >= 160;
      const TARGET_FPS = HEAVY ? 30 : 60;
      const STEP_MS = 1000 / TARGET_FPS;

      let loopsRunning = false;
      let rafId: number | null = null;
      let lastT = 0;
      let acc = 0;

      const tick = (now: number) => {
        if (!loopsRunning) return;
        rafId = window.requestAnimationFrame(tick);

        if (!lastT) lastT = now;
        const dt = Math.min(60, now - lastT);
        lastT = now;
        acc += dt;

        // Keep updates bounded. When the tab is busy we drop time instead of spiraling.
        const MAX_STEPS = 2;
        let steps = 0;
        while (acc >= STEP_MS && steps < MAX_STEPS) {
          Engine.update(engine, STEP_MS);
          acc -= STEP_MS;
          steps += 1;
        }

        Render.world(render);
      };

      const startLoops = () => {
        if (loopsRunning) return;
        loopsRunning = true;
        lastT = 0;
        acc = 0;
        rafId = window.requestAnimationFrame(tick);
      };
      const stopLoops = () => {
        if (!loopsRunning) return;
        loopsRunning = false;
        if (rafId != null) window.cancelAnimationFrame(rafId);
        rafId = null;
      };

      const wall = 120;
      const floor = Bodies.rectangle(
        width / 2,
        height + wall / 2,
        width + wall * 2,
        wall,
        {
          isStatic: true,
          render: { fillStyle: "transparent" },
        },
      );
      const left = Bodies.rectangle(
        -wall / 2,
        height / 2,
        wall,
        height + wall * 2,
        {
          isStatic: true,
          render: { fillStyle: "transparent" },
        },
      );
      const right = Bodies.rectangle(
        width + wall / 2,
        height / 2,
        wall,
        height + wall * 2,
        {
          isStatic: true,
          render: { fillStyle: "transparent" },
        },
      );
      Composite.add(engine.world, [floor, left, right]);

      // Card size scales with how many certificates are visible.
      // Fewer results => larger cards. More results => smaller cards.
      const n = Math.max(1, certificates.length);
      const columns = clamp(Math.ceil(Math.sqrt(n) * 1.25), 2, 11);
      const rawW = width / (columns + 0.75);
      const maxW = Math.min(380, Math.floor(width * 0.42));
      const cardW = clamp(Math.floor(rawW), 84, maxW);

      const WIDTH_PRESETS = [128, 256, 384, 640];
      const pickWidth = (desired: number) => {
        let best: number = WIDTH_PRESETS[0]!;
        let bestD = Math.abs(best - desired);
        for (const w of WIDTH_PRESETS) {
          const d = Math.abs(w - desired);
          if (d < bestD) {
            best = w;
            bestD = d;
          }
        }
        return best;
      };
      const spriteTexture = (src: string) => {
        // Use Next's image optimizer to avoid decoding full-size certificate images as sprites.
        const desiredW = Math.ceil(cardW * (render.options.pixelRatio || 1));
        const w = pickWidth(desiredW);
        const q = certificates.length >= 160 ? 55 : 65;
        return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`;
      };

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
        // If we paused after everything fell asleep, resume on interaction.
        startLoops();
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

      startLoops();
      setReady(true);

      // Progressive spawn so the scene becomes interactive immediately.
      let spawnAt = 0;
      let spawnTimer: number | null = null;
      const BATCH = 6;
      const INTERVAL_MS = 2000;

      // When there are lots of certificates, drawing hundreds of sprites while they fall is expensive.
      // Strategy: spawn placeholder cards first (no textures), then hydrate sprites gradually once cards fall asleep.
      let hydrateTimer: number | null = null;
      let hydrating = false;
      const hydrateSomeSprites = async () => {
        if (!HEAVY) return;
        if (cancelled) return;
        if (hydrating) return;
        hydrating = true;
        try {
          const bodies = Composite.allBodies(engine.world) as BodyWithCert[];
          const targets = bodies
            .filter((b) => {
              if (b.isStatic) return false;
              if (!b.plugin?.certificate) return false;
              if (!b.isSleeping) return false;
              const tex = b.render.sprite?.texture;
              return !tex;
            })
            .slice(0, 4);

          if (targets.length === 0) return;

          // Ensure we render while swapping textures.
          startLoops();

          for (const b of targets) {
            const cert = b.plugin!.certificate!;
            const w = b.plugin?.w ?? cardW;
            const h = b.plugin?.h ?? Math.round((cardW * 10) / 16);
            let texture = spriteTexture(cert.src);
            let info = await preloadTexture(texture);
            if (cancelled) return;

            if (!info.ok || !info.img) {
              texture = cert.src;
              info = await preloadTexture(texture);
              if (cancelled) return;
            }

            if (!info.ok || !info.img) continue;

            // Matter.Render will pull from render.textures if present.
            render.textures[texture] = info.img;
            if (cancelled) return;
            b.render.sprite = {
              texture,
              xScale: w / info.nw,
              yScale: h / info.nh,
            };
          }
        } finally {
          hydrating = false;
        }
      };

      const spawnNext = async () => {
        if (cancelled) return;
        const start = spawnAt;
        if (start >= certificates.length) return;
        const end = Math.min(start + BATCH, certificates.length);
        spawnAt = end;

        const slice = certificates.slice(start, end);

        if (HEAVY) {
          for (let i = 0; i < slice.length; i++) {
            const c = slice[i]!;
            const cardH = Math.round((cardW * 10) / 16);

            const globalIndex = start + i;
            const col = globalIndex % columns;
            const cellW = width / columns;
            const jitter = (Math.random() - 0.5) * cellW * 0.25;
            const x = clamp(
              Math.round((col + 0.5) * cellW + jitter),
              Math.floor(cardW * 0.6),
              Math.floor(width - cardW * 0.6),
            );
            const rowBand = Math.floor(globalIndex / columns) % 6;
            const y = -Math.round(cardH * (1 + rowBand * 0.65));
            const angle = (Math.random() - 0.5) * 0.6;

            const body = Bodies.rectangle(x, y, cardW, cardH, {
              restitution: 0.1,
              friction: 0.25,
              frictionAir: 0.08,
              density: 0.002,
              sleepThreshold: 15,
              angle,
              chamfer: { radius: Math.max(6, Math.floor(cardW * 0.05)) },
              render: {
                fillStyle: "rgba(255,255,255,0.06)",
                strokeStyle: "rgba(168,85,247,0.22)",
                lineWidth: 1,
              },
            });
            (body as BodyWithCert).plugin = { certificate: c, w: cardW, h: cardH };
            Composite.add(engine.world, body);
          }

          if (spawnAt >= certificates.length && hydrateTimer == null) {
            hydrateTimer = window.setInterval(() => {
              void hydrateSomeSprites();
            }, 400);
          }

          spawnTimer = window.setTimeout(() => {
            spawnTimer = null;
            void spawnNext();
          }, INTERVAL_MS);
          return;
        }

        const textures = slice.map((c) => spriteTexture(c.src));
        let infos = await Promise.all(textures.map((t) => preloadTexture(t)));
        if (cancelled) return;

        for (let i = 0; i < slice.length; i++) {
          const c = slice[i]!;
          let texture = textures[i]!;
          let info = infos[i]!;
          if (!info.ok || !info.img) {
            texture = c.src;
            info = await preloadTexture(texture);
            if (cancelled) return;
          }
          if (!info.ok || !info.img) continue;

          render.textures[texture] = info.img;

          const aspect = info.nw / Math.max(1, info.nh);
          const cardH = Math.round(cardW / clamp(aspect, 1.15, 2.1));

          const globalIndex = start + i;
          const col = globalIndex % columns;
          const cellW = width / columns;
          const jitter = (Math.random() - 0.5) * cellW * 0.25;
          const x = clamp(
            Math.round((col + 0.5) * cellW + jitter),
            Math.floor(cardW * 0.6),
            Math.floor(width - cardW * 0.6),
          );
          // Keep spawn height bounded so the last items don't fall from extremely high up.
          const rowBand = Math.floor(globalIndex / columns) % 6;
          const y = -Math.round(cardH * (1 + rowBand * 0.65));
          const angle = (Math.random() - 0.5) * 0.6;

          const body = Bodies.rectangle(x, y, cardW, cardH, {
            restitution: 0.15,
            friction: 0.2,
            frictionAir: certificates.length >= 160 ? 0.06 : 0.03,
            density: 0.002,
            sleepThreshold: certificates.length >= 160 ? 20 : 40,
            angle,
            chamfer: { radius: Math.max(6, Math.floor(cardW * 0.05)) },
            render: {
              sprite: {
                texture,
                xScale: cardW / info.nw,
                yScale: cardH / info.nh,
              },
            },
          });
          (body as BodyWithCert).plugin = { certificate: c };
          Composite.add(engine.world, body);
        }

        spawnTimer = window.setTimeout(() => {
          spawnTimer = null;
          void spawnNext();
        }, INTERVAL_MS);
      };

      void spawnNext();

      // If everything is sleeping (common after a few seconds), pause the loop.
      // With 200+ bodies this saves a lot of CPU/GPU while the scene is idle.
      let idleTimer: number | null = null;
      const scheduleIdleCheck = () => {
        if (idleTimer != null) return;
        idleTimer = window.setInterval(() => {
          if (cancelled) return;
          if (!loopsRunning) return;
          if (spawnAt < certificates.length) return;

          const bodies = Composite.allBodies(engine.world);
          const anyAwake = bodies.some(
            (b) => !b.isStatic && !(b as Matter.Body).isSleeping
          );
          if (!anyAwake) stopLoops();
        }, 750);
      };
      scheduleIdleCheck();

      cleanup = () => {
        setReady(false);
        if (spawnTimer != null) window.clearTimeout(spawnTimer);
        if (hydrateTimer != null) window.clearInterval(hydrateTimer);
        if (idleTimer != null) window.clearInterval(idleTimer);
        render.canvas.removeEventListener("pointerdown", onPointerDown);
        render.canvas.removeEventListener("pointerup", onPointerUp);
        stopLoops();
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
        style={{
          height: "calc(100vh - 220px)",
          minHeight: 800,
          maxHeight: 1100,
        }}
      />
    </div>
  );
}
