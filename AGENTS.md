# AGENTS.md

## Repo Snapshot
- Next.js App Router app (`next@16.2.3`, `react@19.2.4`) with TypeScript.
- Tailwind CSS v4 uses CSS-first setup: `postcss.config.mjs` + `app/globals.css` (`@import "tailwindcss";` + `@theme inline`). No `tailwind.config.*`.

## Commands (npm)
- Use `npm` (repo has `package-lock.json`).
- Dev server: `npm run dev`
- Production build: `npm run build` (Next performs typechecking during build)
- Start prod server: `npm run start`
- Lint: `npm run lint` (flat config in `eslint.config.mjs`)
- Standalone typecheck (no script): `npx tsc --noEmit`
- No tests are configured (no `test` script, no test files).

## Code Layout / Entry Points
- App entrypoints live in `app/`: `app/layout.tsx` (root layout + `metadata`), `app/page.tsx` (home).
- Global styles in `app/globals.css` (Tailwind `@import "tailwindcss";` and `@theme inline`).
- Certificate images live in `public/certs/*.webp` and are served at `/certs/<filename>.webp`.
- Certificates list is generated server-side from the filesystem: `lib/certificates.ts` does `readdir(process.cwd()/public/certs)`, filters `*.webp`, sorts, and derives labels from filenames (`-` => space).
- `app/page.tsx` sets `export const dynamic = "force-dynamic"` so the filesystem listing isn’t cached; switching to static/edge runtime will break/alter this behavior.

## Repo-Specific Gotchas
- TS path alias `@/*` maps to the repo root (`tsconfig.json`: `"@/*": ["./*"]`), not to `src/`.
