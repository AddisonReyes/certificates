# Design

This site should feel connected to `addisonreyes.com` without being a direct copy. The portfolio site is personal and editorial; this project is a certificate gallery, so it should use more horizontal space and prioritize browsing.

## Visual Direction

- Dark, professional background with subtle fuchsia accents.
- Serif typography to stay aligned with the main portfolio identity.
- Wide layout for desktop and large screens.
- Rounded glass-like surfaces for cards, controls, modal, and physics panels.
- Certificates should remain the visual focus. Decorative effects must stay behind the content.

## Background

Use layered gradients and non-repeating atmospheric shapes. Avoid tiled or highly repetitive texture patterns, especially behind the physics view, because repeated lines can look like rendering artifacts when the canvas is wide.

The background should:

- Be subtle enough that certificate images remain readable.
- Avoid large repeated image-like patterns.
- Use fuchsia sparingly as brand energy, not as the entire palette.

## Layout

- Use the full available desktop width with a large max container.
- Keep mobile layouts single-column and lightweight.
- Do not make the certificate app feel like a marketing landing page. The first screen should provide search, view controls, and immediate access to certificates.
- Grid cards may expand to more columns on large monitors.

## Grid View

The grid is the default view because it is the fastest and most accessible way to browse certificates.

Guidelines:

- Render a small initial batch for mobile and performance.
- Use `Load more` instead of mounting every image at once.
- Keep certificate titles readable and filenames secondary.
- Use lazy images unless a future measured performance pass shows a specific image should be prioritized.

## Physics View

The physics view is a delightful secondary interaction, not the default browsing experience.

Guidelines:

- Load it only when selected.
- Keep Matter.js out of the initial bundle.
- Limit active bodies for large certificate collections.
- Use placeholder cards first and hydrate textures gradually.
- Prioritize smooth interaction over literal simulation of every certificate.

## Accessibility

- Preserve keyboard focus styles.
- Buttons must use real `<button>` elements.
- Certificate images need descriptive alt text from the generated label.
- Modal must close with Escape and prevent background scroll while open.

## Performance

Mobile performance matters more than visual excess.

Avoid:

- Rendering hundreds of cards on first load.
- Loading Matter.js on first paint.
- Preloading many certificate images.
- Adding repeated or animated background effects that compete with the certificate images.

Use:

- Static export.
- Lazy-loaded images.
- Code splitting for heavy views.
- Focused unit tests for data normalization and search behavior.
