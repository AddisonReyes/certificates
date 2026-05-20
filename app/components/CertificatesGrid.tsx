"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Certificate } from "../../lib/certificates";

const INITIAL_VISIBLE_CERTS = 18;
const LOAD_MORE_CERTS = 18;

export function CertificatesGrid({
  certificates,
  onOpen,
}: {
  certificates: Certificate[];
  onOpen: (c: Certificate) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CERTS);

  const visibleCertificates = useMemo(
    () => certificates.slice(0, visibleCount),
    [certificates, visibleCount],
  );
  const hasMore = visibleCount < certificates.length;

  if (certificates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/65">
        No certificates match your search.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visibleCertificates.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left shadow-[0_12px_28px_rgba(0,0,0,0.1)] transition hover:border-fuchsia-500/25 hover:bg-white/[0.07] focus:outline-none"
          >
            <div className="relative aspect-[16/10] w-full bg-black/40">
              <Image
                src={c.src}
                alt={c.label}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition duration-300 group-hover:scale-[1.01]"
                priority={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div className="flex min-h-24 items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="line-clamp-2 text-lg font-bold leading-tight text-white capitalize">
                  {c.label}
                </div>
                <div className="mt-2 truncate text-xs text-white/50">
                  {c.filename}
                </div>
              </div>
              <div className="shrink-0 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/68 transition group-hover:border-fuchsia-500/25 group-hover:text-fuchsia-300">
                Open
              </div>
            </div>
          </button>
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_CERTS, certificates.length),
              )
            }
            className="rounded-full bg-fuchsia-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-fuchsia-700"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
