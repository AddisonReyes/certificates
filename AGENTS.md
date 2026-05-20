# AGENTS.md

## Project

Portfolio-style certificate gallery for Addison Reyes. The app displays `.webp` certificates from `public/certs`, supports search, opens certificates in a modal, and includes an optional Matter.js physics view.

## Stack / Quirks

- Next.js App Router with React 19 and TypeScript.
- Tailwind CSS v4 is configured CSS-first:
  - `postcss.config.mjs`
  - `app/globals.css`
  - No `tailwind.config.*`
- Static export is enabled in `next.config.ts` with `output: "export"`.
- Images are unoptimized because static export has no Next image optimizer endpoint.
- TS path alias `@/*` maps to the repo root, not `src/`.

## Commands

Use `npm`; this repo has `package-lock.json`.

```bash
npm run dev        # Local development
npm run lint       # ESLint
npm run typecheck  # TypeScript no-emit check
npm run test       # Vitest unit tests
npm run build      # Static export build
npm run ci         # lint + typecheck + test + build
```

## App Entry / Data Source

- Entry points:
  - `app/layout.tsx`
  - `app/page.tsx`
- Certificate data:
  - `lib/certificates.ts` reads `public/certs`
  - filters `*.webp`
  - sorts filenames
  - derives labels and search keys
- Label/search normalization lives in `lib/certificateLabels.ts`.
- Tests for label/search behavior live in `lib/certificateLabels.test.ts`.

## Adding Certificates

Drop a `.webp` file into:

```text
public/certs/
```

The public URL becomes:

```text
/certs/<filename>.webp
```

Filenames are normalized for display and search. Preserve readable filenames with hyphens, for example:

```text
node-js-and-express-for-beginners.webp
diploma-c-plus-plus.webp
diploma-csharp.webp
```

When adding new naming conventions, update `lib/certificateLabels.ts` and add tests.

## UI / Design

Read `DESIGN.md` before making broad visual changes.

Important direction:

- Similar to `addisonreyes.com`, but not identical.
- Dark professional background, subtle fuchsia accents, serif typography.
- Use wide horizontal space on desktop.
- Avoid repeating/tiled background textures.
- Keep certificates as the visual focus.

## Performance

- Grid is the default view for mobile and first-load performance.
- Grid renders an initial batch and uses `Load more`.
- Physics view is loaded with `next/dynamic` and `ssr: false`.
- Matter.js must stay out of the initial bundle.
- Physics caps active bodies and hydrates textures gradually for large collections.
- Do not preload many certificate images.

## Testing / CI

- Unit tests use Vitest.
- CI is in `.github/workflows/ci.yml`.
- Pull requests and pushes to `main` run:
  - install with `npm ci`
  - lint
  - typecheck
  - tests
  - build

## Safe Change Checklist

Before finishing a code change, run:

```bash
npm run ci
```

For smaller changes while iterating, at least run the relevant command:

```bash
npm run lint
npm run test
npm run build
```
