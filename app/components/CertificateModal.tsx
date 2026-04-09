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
        className="absolute inset-0 bg-black/70"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--background)] shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {certificate.label}
              </div>
              <div className="truncate text-xs text-white/50">
                {certificate.filename}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="relative max-h-[80vh] w-full overflow-auto p-4">
            <div className="relative mx-auto w-full max-w-5xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={certificate.src}
                  alt={certificate.label}
                  fill
                  sizes="100vw"
                  className="object-contain bg-black/30"
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
