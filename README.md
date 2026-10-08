# Reading Roulette

A static prompt builder for language-learning reading practice, built with React, TypeScript, and Vite. Product scope and architectural constraints live in [PROJECT.md](PROJECT.md).

This foundation includes reading preferences, small static Topic / Format / Tone catalogs, all 15 requested CEFR choices, and a browser-generated prompt preview for a fixed combination. The slot machine interaction comes in a later stage.

## Local development

Prerequisites: Node.js 22.12+ and pnpm 10.22.0. This foundation was prepared using Node.js 24.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Verification and production build

```sh
pnpm typecheck
pnpm build
pnpm preview
```

`build` checks TypeScript and writes static production assets to `dist/`. `preview` serves that build locally. No backend, AI API, credentials, or environment variables are required.

GitHub Pages deployment has not been configured. Choose the appropriate Vite base path when hosting is implemented.
