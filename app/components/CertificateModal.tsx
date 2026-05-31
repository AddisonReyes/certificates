"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Certificate } from "../../lib/certificates";

async function imageToPdf(certificate: Certificate) {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.src = certificate.src;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load certificate image."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create image canvas.");

  context.drawImage(image, 0, 0);

  const { jsPDF } = await import("jspdf");
  const width = canvas.width;
  const height = canvas.height;
  const pdf = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
  pdf.save(`${certificate.id}.pdf`);
}

export function CertificateModal({
  certificate,
  onClose,
}: {
  certificate: Certificate | null;
  onClose: () => void;
}) {
  const [downloadState, setDownloadState] = useState<{
    certificateId: string | null;
    status: "idle" | "downloading" | "error";
  }>({ certificateId: null, status: "idle" });

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

  const activeDownloadState =
    downloadState.certificateId === certificate.id
      ? downloadState.status
      : "idle";

  const handleDownload = async () => {
    if (activeDownloadState === "downloading") return;

    setDownloadState({ certificateId: certificate.id, status: "downloading" });
    try {
      await imageToPdf(certificate);
      setDownloadState({ certificateId: certificate.id, status: "idle" });
    } catch {
      setDownloadState({ certificateId: certificate.id, status: "error" });
    }
  };

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
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={activeDownloadState === "downloading"}
                className="rounded-full border border-fuchsia-500/25 bg-fuchsia-600/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-100 transition hover:bg-fuchsia-600/25 hover:text-white disabled:cursor-wait disabled:opacity-70"
              >
                {activeDownloadState === "downloading" ? "Preparing" : "Download"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/12 bg-white/[0.03] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-fuchsia-500/25 hover:bg-fuchsia-600/15 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          {activeDownloadState === "error" ? (
            <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-2 text-xs text-red-100">
              Could not generate the PDF. Please try again.
            </div>
          ) : null}

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
