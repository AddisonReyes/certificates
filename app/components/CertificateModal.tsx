"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Certificate } from "../../lib/certificates";

export function CertificateModal({
  certificate,
  onClose,
}: {
  certificate: Certificate | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!certificate) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-white">
                {certificate.label}
              </div>
              <div className="truncate text-xs text-white/50">
                {certificate.filename}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/12 bg-white/[0.03] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-fuchsia-500/25 hover:bg-fuchsia-600/15 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="relative max-h-[82vh] w-full overflow-auto bg-black/40 p-4">
            <div className="relative mx-auto w-full max-w-5xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                <Image
                  src={certificate.src}
                  alt={certificate.label}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
