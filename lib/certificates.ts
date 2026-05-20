import { readdir } from "node:fs/promises";
import path from "node:path";

export type Certificate = {
  id: string;
  filename: string;
  src: string;
  label: string;
  searchKey: string;
};

const TOKEN_LABELS = new Map([
  ["api", "API"],
  ["apis", "APIs"],
  ["ai", "AI"],
  ["bi", "BI"],
  ["csharp", "C#"],
  ["css", "CSS"],
  ["dart", "Dart"],
  ["defold", "Defold"],
  ["docker", "Docker"],
  ["excel", "Excel"],
  ["express", "Express"],
  ["fastapi", "FastAPI"],
  ["flask", "Flask"],
  ["flutter", "Flutter"],
  ["git", "Git"],
  ["github", "GitHub"],
  ["godot", "Godot"],
  ["html", "HTML"],
  ["ia", "IA"],
  ["itla", "ITLA"],
  ["javascript", "JavaScript"],
  ["jquery", "jQuery"],
  ["jupyter", "Jupyter"],
  ["kubernetes", "Kubernetes"],
  ["matplotlib", "Matplotlib"],
  ["mlops", "MLOps"],
  ["mongodb", "MongoDB"],
  ["mysql", "MySQL"],
  ["nodejs", "Node.js"],
  ["nosql", "NoSQL"],
  ["numpy", "NumPy"],
  ["odoo", "Odoo"],
  ["oop", "OOP"],
  ["pandas", "Pandas"],
  ["pip", "pip"],
  ["postgresql", "PostgreSQL"],
  ["python", "Python"],
  ["react", "React"],
  ["rest", "REST"],
  ["rust", "Rust"],
  ["seaborn", "Seaborn"],
  ["snowflake", "Snowflake"],
  ["sql", "SQL"],
  ["turtle", "Turtle"],
  ["typescript", "TypeScript"],
  ["ui", "UI"],
  ["uml", "UML"],
  ["unity", "Unity"],
  ["ux", "UX"],
]);

const PHRASE_LABELS: Array<[RegExp, string]> = [
  [/\bc plus plus\b/g, "C++"],
  [/\bc sharp\b/g, "C#"],
  [/\bnode js\b/g, "Node.js"],
  [/\bserver side\b/g, "Server-Side"],
  [/\bobject oriented\b/g, "Object-Oriented"],
  [/\bweb apps\b/g, "Web Apps"],
  [/\bwebapps\b/g, "Web Apps"],
  [/\brest apis\b/g, "REST APIs"],
];

function titleCaseWord(word: string) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function toLabel(id: string) {
  let label = id
    .replaceAll("+", " plus ")
    .replace(/c-plus-plus/gi, "c plus plus")
    .replace(/csharp/gi, "c sharp")
    .replace(/node-js/gi, "node js")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  for (const [pattern, replacement] of PHRASE_LABELS) {
    label = label.replace(pattern, replacement);
  }

  return label
    .split(" ")
    .map((word) => TOKEN_LABELS.get(word) ?? titleCaseWord(word))
    .join(" ");
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function searchAliases(id: string, label: string) {
  return [
    id,
    label,
    label.replaceAll("+", " plus "),
    label.replaceAll("#", " sharp "),
    id.replace(/c-plus-plus/gi, "c++ cplusplus cpp c plus plus"),
    id.replace(/csharp/gi, "c# csharp c sharp"),
    id.replace(/node-js/gi, "node.js nodejs node js"),
  ].join(" ");
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
        searchKey: normalize(searchAliases(id, label)),
      };
    });
}
