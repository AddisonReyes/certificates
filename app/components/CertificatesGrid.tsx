"use client";

import Image from "next/image";
import type { Certificate } from "../../lib/certificates";

export function CertificatesGrid({
  certificates,
  onOpen,
}: {
  certificates: Certificate[];
  onOpen: (c: Certificate) => void;
}) {
  if (certificates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        No certificates match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {certificates.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onOpen(c)}
          className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left ring-0 transition hover:border-[color:var(--accent)]/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/25"
        >
          <div className="relative aspect-[16/10] w-full bg-black/25">
            <Image
              src={c.src}
              alt={c.label}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 16vw"
              className="object-contain transition duration-300 group-hover:scale-[1.01]"
              priority={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white capitalize">
                {c.label}
              </div>
              <div className="truncate text-xs text-white/50">{c.filename}</div>
            </div>
            <div className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[11px] text-white/80 ring-1 ring-[color:var(--accent)]/25 group-hover:bg-[color:var(--accent)]/10">
              View
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
