export type CertificatesView = "grid" | "physics";

export function randomInitialView(): CertificatesView {
  return Math.random() < 0.5 ? "grid" : "physics";
}
