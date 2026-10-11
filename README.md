# Reading Roulette

A static prompt builder for language-learning reading practice, built with React, TypeScript, and Vite. Choose your reading preferences, press **SPIN**, and copy the resulting prompt into your preferred AI chat to generate the text.

**[Open Reading Roulette](https://iaroslav-tkachenko.github.io/reading-roulette/)** · [Build and deployment runs](https://github.com/iaroslav-tkachenko/reading-roulette/actions/workflows/pages.yml)

## Current application

Local v10 implementation, October 11, 2026: the accepted layered scene has live settings, Copy prompt, a mechanical SPIN press, three animated drum strips, key waves, moving side-wheel treads and hinged drum pointers with slow, broad lift-and-return cycles during SPIN. All 19 keys move with their letters twice in shuffled orders, with stronger 4.5-unit travel, and return before the final drum stop. Wheel silhouettes and axles stay fixed while masked brass treads accelerate and brake on the common clock, stopping with the last drum at 2440 ms. Interrupted tread positions persist into the next spin. The prepared result and full prompt commit together after the final stop; settings/Copy are temporarily disabled and repeated SPIN is ignored. Reduced motion safely produces the prepared result without secondary motion. Help is skipped at the user's request until its text is revised. See the [step 10 implementation and verification report](docs/design/implementation-step10-v10/README.md). The previously published starter interactions described below are historical behavior; this local change has not been published.

The source catalogs contain 26 topics, 44 formats, 30 angles, and [11 languages](docs/LANGUAGES.md): English, Spanish, French, Japanese, German, Korean, Italian, Chinese (Mandarin), Russian, Portuguese, Serbian. All 15 requested CEFR choices and Short / Medium / Long are available. Plus/minus choices tune around standard CEFR levels; they are internal difficulty labels. Prose volume follows the approved level profiles; Japanese and Mandarin use relative length and structural instructions without numeric word or character targets.

SPIN selects a **Topic × Format × Angle** combination. Selection filters complete combinations by content profile, length and explicit semantic allowlists, chooses an available family by its normalized approved weight, then uniformly chooses format, topic and angle. Repeated combinations are allowed. The screen and prompt use the same combination. A valid preference change preserves the combination, immediately updates the prompt and briefly confirms Prompt updated. An invalid change clears the result and prompt, disables Copy and requests an explicit SPIN. Returning to old settings does not restore a cleared result. The initial canonical combination is Travel / Everyday story / Unexpected discovery with English / B1+ / Medium.

**Copy prompt** copies the full current preview after a click, with confirmation tied to the exact prompt copied. If clipboard access is unavailable, select and copy the preview manually. SPIN and Copy support keyboard activation and visible focus. Selection and prompt composition run locally; no backend, model API, credentials, analytics, or remote data loading is required. The external AI chat generates the reading text, whose level, length, and accuracy the app cannot guarantee.

Register, tone, genre, and narrative perspective are supporting instructions within formats and angles, without separate controls or hidden random draws. Angle replaces the former Tone reel throughout current code and specifications. Older design PNGs retain Tone as historical visual references.

## Approved requirements and remaining implementation

The full approved catalogs and rules are implemented in the local v10 application. The public Pages site remains the previously published starter; this stage has not been pushed or published.

| Area | Approved specification | Current implementation |
| --- | --- | --- |
| Reading balance | [6 families and weights by level](docs/READING_FAMILIES.md), including visual reading | Implemented; unavailable families excluded before normalization |
| Topic | [26 topics and beginner restrictions](docs/TOPICS.md) | 26 canonical topics with profile-specific disclosures |
| Format | [44 formats and recognizable structures](docs/FORMATS.md), including sourced news, speeches, IT follow-ups, and visual formats | 44 canonical formats, eight volume models |
| Angle | [30 angles, minimum profiles, and compatibility](docs/ANGLES.md) | 30 canonical angles; explicit full-combination eligibility |
| Level and length | [Profile ranges, 44-format length matrix, and settings behavior](docs/LEVELS_LENGTH.md) | Eight volume models, shared eligibility, reset/preserve state and update confirmation implemented |
| Content status | [Fiction, training, factual, and sourced material](docs/CONTENT_STATUS.md) | Four statuses and conditional source/visual/partial-output instructions implemented |
| Design and motion | [Design](docs/design/DESIGN.md), [motion specification](docs/design/MOTION.md), and [local prototype](docs/design/motion-preview/README.md) | Accepted v10 scene and coordinated mechanics preserved; real browser QA pending |
| Languages | [Recovered original eight plus Russian, Portuguese, Serbian](docs/LANGUAGES.md) | All 11 languages connected to settings and prompt |

All future UI and catalog work must follow [the catalog contract](docs/CATALOGS.md). For animated SPIN, prepare the entire valid combination and prompt before motion starts; Angle selection must not wait for another reel to stop. The approved filters must preserve valid combinations and clear invalid ones with an explicit new SPIN. The approved prompt-update confirmation must leave the updated text and Copy immediately available. These rules are connected to the current runtime and covered by the step 10 checks.

See [PROJECT.md](PROJECT.md) for architecture, the [system audit](docs/CATALOG_VALIDATION.md) for remaining work and coverage limits, and [deployment documentation](docs/DEPLOYMENT.md) for publication and verification.

## Local development

Prerequisites: Node.js 22.12+ and pnpm 10.22.0. CI uses Node.js 24.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173/ (`pnpm dev --host 127.0.0.1 --port 5173 --strictPort`). The separate motion prototype is available only through the development server at `/docs/design/motion-preview/`; it is not included in the deployed site.

## Verification and production build

```sh
node docs/validation/audit-catalogs.mjs
node docs/validation/audit-starter-runtime.mjs
pnpm typecheck
pnpm build --base=/reading-roulette/
node docs/design/implementation-step9-v10/verify.mjs
git diff --check
pnpm preview
```

`build` checks TypeScript and writes static assets to `dist/`. GitHub Actions repeats the audits, checks the motion prototype's TypeScript, and builds with `--base=/reading-roulette/` before publishing to GitHub Pages. For a local preview of that deployment build, run `pnpm build --base=/reading-roulette/` and open the preview server's `/reading-roulette/` path.

The metadata audit covers the approved documents. The full runtime audit retains its legacy filename and checks all 1,544,400 level/length/tuple cases, 134,550 available selection branches, 1,480,050 prompts, exact catalog metadata, normalized probabilities, state transitions and stale clipboard replies. The adapted step 9 regression covers 61 scene/mechanics checks, 1,936 transitions, 495 settings and 14,784 copied prompt representatives. See the [step 10 report](docs/design/implementation-step10-v10/README.md) for commands, artifacts and limits.

Interactive browser verification after the Angle migration remains incomplete: the in-app Browser runtime failed to load with EPERM. Build, audit, and HTTP/asset checks do not establish visual, keyboard, clipboard, or accessibility verification. Historical checks are retained in the [motion verification record](docs/design/motion-preview/VERIFICATION.md).

For manual acceptance, use the [concrete step 10 scenarios](docs/design/implementation-step10-v10/README.md#ручная-проверка), including invalid settings followed by explicit SPIN, special volume models, sources and visual prompts. Actual browser rendering and system clipboard remain unverified after the in-app Browser EPERM failure.
