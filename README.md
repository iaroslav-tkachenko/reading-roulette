# Reading Roulette

A static prompt builder for language-learning reading practice, built with React, TypeScript, and Vite. Product scope and architectural constraints live in [PROJECT.md](PROJECT.md).

The app includes reading preferences, small static Topic / Format / Tone catalogs, all 15 requested CEFR choices, and a browser-generated prompt preview. Press **SPIN** to independently select a random topic, format, and tone. The preview uses that same combination and your current preferences. Changing preferences preserves the combination, and repeated combinations are allowed.

Before the first SPIN, a starter combination and its prompt are already available. SPIN supports keyboard activation with visible focus. Random selection and prompt composition run locally without network requests or additional dependencies. Animated reels and a dedicated Copy prompt button remain future stages; settings and results are not saved.

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
git diff --check
pnpm preview
```

`build` checks TypeScript and writes static production assets to `dist/`. `preview` serves that build locally. No backend, AI API, credentials, or environment variables are required.

GitHub Pages deployment has not been configured. Choose the appropriate Vite base path when hosting is implemented.

## SPIN verification

To check the current interaction in a local browser:

1. On initial load, confirm that Daily life / Short story / Warm appears both in the combination and in the prompt, with English / A2 / Short preferences.
2. Press SPIN several times. Each result must use existing catalog entries, and the Topic, Format, and Tone lines in the prompt must match the displayed combination. Repeated combinations are valid.
3. Change Language, CEFR Level, and Text Length after a spin. Each change must update the corresponding prompt instruction without changing the selected combination.
4. Use Tab to reach SPIN, confirm the visible focus outline, and activate the button with both Enter and Space.
5. Check the browser console for errors and inspect the current screen for layout issues.

Stage 1 was verified locally on October 8, 2026:

- TypeScript checking, the production build, and Git whitespace checks passed.
- One-off Node.js checks covered all 27 catalog combinations, three independent draws per selection, random-source boundaries, allowed repeats, 500 default-random selections, explicit errors for empty or sparse catalogs and invalid random samples, and all 4,860 combinations of catalog results and reading preferences. No test framework or persistent test suite was added.
- Browser checks passed for initial load, six consecutive spins (including a repeated result), prompt/result consistency, all three preference changes after a spin, keyboard activation, and visible focus. No console warnings or errors or obvious layout issues were observed on the tested desktop screen.
- Implementation self-review checked state consistency, separation of selection from UI, typing, accessibility, and the static-only boundaries. Random selection runs only in the click handler; the prompt is derived from the same combination state used for the displayed result.
