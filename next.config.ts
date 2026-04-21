import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages static hosting: produce a pure HTML export in `out/`.
  output: "export",
  // Static export has no image optimization server; serve images as-is.
  images: { unoptimized: true },
};

export default nextConfig;
