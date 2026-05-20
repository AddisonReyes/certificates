# Certificates

A portfolio-style certificate gallery for Addison Reyes. The site showcases course completion certificates, diplomas, and IT credentials with a searchable grid and an optional interactive physics view.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4, configured CSS-first in `app/globals.css`
- Matter.js for the optional physics view
- Vitest for unit tests

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev        # Start local development
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
npm run test       # Run unit tests
npm run build      # Build the static export
npm run ci         # Run lint, typecheck, tests, and build
```

## Adding Certificates

Add `.webp` files to:

```text
public/certs/
```

Each file is automatically discovered and served from:

```text
/certs/<filename>.webp
```

The visible certificate label is derived from the filename. Common technology names are normalized, so filenames like `diploma-c-plus-plus.webp`, `diploma-csharp.webp`, and `node-js-and-express-for-beginners.webp` display and search as `C++`, `C#`, and `Node.js`.

## Views

- `Grid`: default view, optimized for mobile performance and first load. It renders a limited number of certificates initially and progressively loads more.
- `Physics`: interactive Matter.js view. It is code-split and loaded only when selected.

## Quality

This repo includes:

- ESLint with Next.js core web vitals and TypeScript rules
- TypeScript strict mode
- Vitest unit tests for certificate label/search normalization
- GitHub Actions CI for pull requests and pushes to `main`

## Deployment

`next.config.ts` uses:

```ts
output: "export"
```

The build produces a static `out/` directory suitable for static hosting providers such as Cloudflare Pages.
