"use client";

import { useMemo, useState } from "react";
import type { Certificate } from "../../lib/certificates";
import type { CertificatesView } from "../../lib/initialView";
import { CertificatesGrid } from "./CertificatesGrid";
import { CertificatesPhysics } from "./CertificatesPhysics";
import { CertificateModal } from "./CertificateModal";

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
    <div className="flex min-h-[100dvh] flex-1 flex-col">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[color:var(--background)]/80 backdrop-blur">
        <div className="flex w-full items-center gap-3 px-4 py-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search (e.g. "python", "diploma", "git")'
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[color:var(--accent)]/60 focus:ring-2 focus:ring-[color:var(--accent)]/20"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                {filtered.length}/{certificates.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={
                view === "grid"
                  ? "rounded-xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-[color:var(--accent)]/55"
                  : "rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
              }
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("physics")}
              className={
                view === "physics"
                  ? "rounded-xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-[color:var(--accent)]/55"
                  : "rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
              }
            >
              Physics
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 px-4 py-6">
        {view === "grid" ? (
          <CertificatesGrid
            certificates={filtered}
            onOpen={(c) => setSelected(c)}
          />
        ) : (
          <CertificatesPhysics
            certificates={filtered}
            onOpen={(c) => setSelected(c)}
          />
        )}
      </div>

      <footer className="mt-auto border-t border-white/10 bg-white/[0.03] px-4 py-6 text-center text-xs text-white/60">
        <div>
          © {new Date().getFullYear()} Addison Reyes. All rights reserved.
        </div>
        <div>
          <a
            href="https://addisonreyes.com"
            target="_blank"
            rel="noreferrer"
            className="text-white/70 underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:text-white"
          >
            addisonreyes.com
          </a>
        </div>
      </footer>

      <CertificateModal certificate={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
