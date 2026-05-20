"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Certificate } from "../../lib/certificates";
import type { CertificatesView } from "../../lib/initialView";
import { CertificatesGrid } from "./CertificatesGrid";
import { CertificateModal } from "./CertificateModal";

const CertificatesPhysics = dynamic(
  () => import("./CertificatesPhysics").then((mod) => mod.CertificatesPhysics),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/65">
        Loading physics...
      </div>
    ),
  },
);

function normalizeQuery(s: string) {
  return s.trim().toLowerCase();
}

export function CertificatesApp({
  certificates,
  initialView,
}: {
  certificates: Certificate[];
  initialView: CertificatesView;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<CertificatesView>(initialView);
  const [selected, setSelected] = useState<Certificate | null>(null);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return certificates;
    return certificates.filter((c) => c.searchKey.includes(q));
  }, [certificates, query]);

  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0d0d0d]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-400/80">
              Addison Reyes
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-white sm:text-4xl">
              Certifications
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/72">
              Completion certificates, IT credentials and certifications
              collected across software engineering, fullstack development,
              backend systems, data, AI Engineering, Machine Learning, and game
              development.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[560px]">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search (e.g. "python", "diploma", "git")'
                  className="h-11 w-full rounded-full border border-white/10 bg-white/[0.035] px-5 pr-20 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-500/50"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50">
                  {filtered.length}/{certificates.length}
                </div>
              </div>

              <div className="grid h-11 grid-cols-2 rounded-full border border-white/10 bg-white/[0.035] p-1">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={
                    view === "grid"
                      ? "rounded-full bg-fuchsia-600 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                      : "rounded-full px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
                  }
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView("physics")}
                  className={
                    view === "physics"
                      ? "rounded-full bg-fuchsia-600 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                      : "rounded-full px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
                  }
                >
                  Physics
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="font-semibold text-white">
                  {certificates.length}
                </div>
                <div className="uppercase tracking-[0.2em] text-white/45">
                  Total
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="font-semibold text-white">
                  {filtered.length}
                </div>
                <div className="uppercase tracking-[0.2em] text-white/45">
                  Visible
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="font-semibold text-white capitalize">
                  {view}
                </div>
                <div className="uppercase tracking-[0.2em] text-white/45">
                  View
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {view === "grid" ? (
          <CertificatesGrid
            key={query}
            certificates={filtered}
            onOpen={(c) => setSelected(c)}
          />
        ) : (
          <CertificatesPhysics
            certificates={filtered}
            onOpen={(c) => setSelected(c)}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-white/[0.08] bg-black/40 px-6 py-10 text-center">
        <div className="mx-auto flex max-w-[1800px] flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <a
              href="https://addisonreyes.com"
              className="transition hover:text-fuchsia-400"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/AddisonReyes"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-fuchsia-400"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/addison-reyes-9aa017208/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-fuchsia-400"
            >
              LinkedIn
            </a>
            <a
              href="https://addisonreyes.com/addison_reyes_cv.pdf"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-fuchsia-400"
            >
              Resume
            </a>
          </div>
          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} Addison Reyes. Santo Domingo, DR.
          </p>
        </div>
      </footer>

      <CertificateModal
        certificate={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
