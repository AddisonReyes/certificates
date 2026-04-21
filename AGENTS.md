# AGENTS.md

## Stack / Quirks
- Next.js App Router (Next 16) + React 19 + TypeScript.
- Tailwind CSS v4 is configured CSS-first: `postcss.config.mjs` + `app/globals.css` (`@import "tailwindcss";` + `@theme inline`). No `tailwind.config.*`.

## Commands
- Use `npm` (repo has `package-lock.json`).
- Dev: `npm run dev`
- Build (includes typecheck): `npm run build`
- Start: `npm run start`
- Lint: `npm run lint` (flat config: `eslint.config.mjs`)
- Extra typecheck (no script): `npx tsc --noEmit`
- No tests are configured (no `test` script).

## App Entry / Data Source
- Entry points are `app/layout.tsx` and `app/page.tsx`.
- Certificates are discovered at runtime from the filesystem: `lib/certificates.ts` reads `public/certs`, filters `*.webp`, sorts, and derives labels from filenames (`-` -> space).
- `app/page.tsx` uses `export const dynamic = "force-dynamic"` so the filesystem listing isn’t cached; switching to static export / edge runtime will change or break certificate listing.

## Assets / UI Gotchas
- Add a certificate by dropping a `.webp` into `public/certs/`; it will be served at `/certs/<filename>.webp` and the visible label comes from the filename.
- The “Physics” view dynamically imports `matter-js` and uses Next’s image optimizer endpoint (`/_next/image?...`) for sprite textures; changes that disable image optimization can break or regress this.

## Repo-Specific Gotchas
- TS path alias `@/*` maps to the repo root (`tsconfig.json`: `"@/*": ["./*"]`), not `src/`.
