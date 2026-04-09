import { readdir } from "node:fs/promises";
import path from "node:path";

export type Certificate = {
  id: string;
  filename: string;
  src: string;
  label: string;
  searchKey: string;
};

function toLabel(id: string) {
  return id.replaceAll("-", " ");
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export async function listCertificates(): Promise<Certificate[]> {
  const certsDir = path.join(process.cwd(), "public", "certs");

  let entries: string[];
  try {
    entries = await readdir(certsDir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => name.toLowerCase().endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => {
      const id = filename.replace(/\.webp$/i, "");
      const label = toLabel(id);
      return {
        id,
        filename,
        src: `/certs/${filename}`,
        label,
        searchKey: normalize(label),
      };
    });
}
