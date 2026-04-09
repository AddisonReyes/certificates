# AGENTS.md

## Repo Snapshot
- Next.js app router project (`next@16`, `react@19`) with TypeScript.
- Tailwind CSS v4 is wired via PostCSS (see `postcss.config.mjs` + `app/globals.css`); there is no `tailwind.config.*`.

## Commands (npm)
- Use `npm` (repo has `package-lock.json`).
- Dev server: `npm run dev`
- Production build: `npm run build` (Next also performs typechecking during build)
- Start prod server: `npm run start`
- Lint: `npm run lint` (flat config in `eslint.config.mjs`)
- Standalone typecheck (no script): `npx tsc --noEmit`

## Code Layout / Entry Points
- App entrypoints live in `app/`: `app/layout.tsx` (root layout + `metadata`), `app/page.tsx` (home).
- Global styles in `app/globals.css` (Tailwind `@import "tailwindcss";` and `@theme inline`).
- Static certificate assets live in `public/certs/*.webp` and are served at `/certs/<filename>.webp`.

## Repo-Specific Gotchas
- TS path alias `@/*` maps to the repo root (`tsconfig.json`: `"@/*": ["./*"]`), not to `src/`.
