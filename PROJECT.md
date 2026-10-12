# Reading Roulette

> October 12, 2026: local EN/RU interface and prompt localization is implemented and tested; see [the implementation report](docs/localization/IMPLEMENTATION.md). Publication has not been performed. Dated stage descriptions below retain their original scope.

> Current local entry, October 12, 2026: steps 1–11 of the [accepted v10 implementation plan](docs/design/IMPLEMENTATION-PLAN-V10.md) render the approved layered scene with native settings, localized How to use, Copy prompt, a mechanical SPIN press, three moving drum strips, two shuffled waves of all 19 keys with their letters and masked brass treads inside both fixed wheel silhouettes, plus six drum-pointer heads on four fixed pins, moving in slow, broad lift-and-return cycles. Key travel is 4.5 units with a brief depressed hold. The keys return before the last drum; wheel treads accelerate and brake on the same clock and stop with the last drum at 2440 ms. Interrupted tread phases persist into the next spin. The prepared result and prompt commit together after the last stop; controls lock temporarily and repeat SPIN is ignored. Step 11 passed 151 production-preview DOM/scenario checks, 46 native Chromium checks and 61 regressions. Compact-layout visual acceptance, physical phone, Safari/Firefox and screen reader remain outstanding; see the [step 11 report](docs/design/implementation-step11-v10/README.md). The [local EN/RU implementation report](docs/localization/IMPLEMENTATION.md) records the translated help and prompt checks. Step 12 is still pending; the local v10 change has not been published.

## Product goal

Reading Roulette is a static web application for foreign-language learners. It helps users find fresh reading ideas and prepare a ready-to-use prompt for ChatGPT, Claude, Gemini, or another LLM chat. The user generates the reading text outside the application.

## User settings

- **Language:** the language of the requested reading text.
- **CEFR Level:** A1, A1+, A2-, A2, A2+, B1-, B1, B1+, B2-, B2, B2+, C1-, C1, C1+, C2.
- **Text Length:** Short / Medium / Long. Approved [level/length rules](docs/LEVELS_LENGTH.md) define profile-dependent word ranges, format-specific fields/items, and a length matrix for all 44 formats. All models are connected; prose uses the content profile, fields/items use structural counts, and Japanese/Mandarin use relative text length.

The plus/minus variants are internal difficulty tuning labels around the six standard CEFR levels. Their instructions guide the external LLM; the app cannot guarantee the generated text's actual proficiency level.

## Topic × Format × Angle

The mandatory product contract, approved on October 9, 2026, is **Topic × Format × Angle**. All application UI, motion prototypes, prompt composition, catalog authoring, and future design work must follow the approved [content catalog principles](docs/CATALOGS.md). Angle is the specific question, situation, or idea explored by the text. It replaces the former Tone reel. Register, emotional tone, genre, narrative perspective, and text structure are supporting instructions within suitable formats and angles; they are not additional controls or independently randomized choices. Older PNGs and archived generation prompts retain the former Tone label as historical visual references, not current product requirements.

The primary interaction is **SPIN**. The full runtime contains 26 topics, 44 formats, 30 angles and 11 languages. Shared eligibility in src/random/compatibility.ts checks content profiles, all three semantic components, format-specific lengths, disclosure instructions and positive family weights. After filtering, the selector chooses a family by its normalized approved weight, then uniformly chooses format, topic and angle with four draws. No hidden topic or angle coefficients are used. See [the step 10 report](docs/design/implementation-step10-v10/README.md) for the explicit authoring rules, metadata sources, algorithms and test evidence.

All eight volume models, four content statuses, real-source news/reportage prompts and visual/partial-result instructions are connected. The app builds prompts only; external chats search/read sources and create text/images. Valid settings changes preserve the current combination, immediately update the prompt and show Prompt updated for 1600 ms with a 120/240 ms accent. Invalid changes clear the whole result and prompt, disable Copy and request SPIN; switching back does not restore a cleared combination. Clipboard epochs reject outdated replies, including A → B → A changes. How to use is implemented as a localized dialog; the EN/RU checks and evidence are recorded in [the localization report](docs/localization/IMPLEMENTATION.md).

For animated SPIN, prepare the complete valid combination and prompt once before motion starts. Local compatibility filtering must not depend on animation events: Angle does not wait for Topic or Format to stop. The updated [motion v2 requirements](docs/design/MOTION.md), requested on October 9, use a shared start, 16/23/30 passing positions, and stops at 1480/1960/2440 ms: the remaining reels stay fast when an earlier reel stops. The accepted interaction uses a depressed SPIN key and bounded motion in side wheels and decorative keycaps. As of October 10, the separate local prototype implemented motion v2 with simplified CSS artwork; at that time, real browser playback remained unverified. The later step 11 browser checks cover the current main application in isolated headless and visible Chromium; see [its report](docs/design/implementation-step11-v10/README.md). Reduced motion returns the result without an artificial wait or secondary movement. Handle an empty valid set before starting a successful-result animation; measure full-catalog filtering performance during implementation rather than using animation duration as a computation budget.

The screen starts with a fixed valid canonical combination and a live prompt preview. Pressing SPIN updates the combination and its prompt together. Changing Language, CEFR Level, or Text Length preserves a valid combination and clears an invalid one with an explicit SPIN request. Selection happens only on button activation, not during rendering. SPIN supports keyboard activation and visible focus, and the result is announced politely to assistive technology. Copy prompt copies the full current preview after an explicit button activation using the browser Clipboard API. A result is announced only for the exact prompt copied; if copying is unavailable or rejected, the user is told to select and copy the readable preview manually.

Random selection is a separate typed TypeScript function. Empty catalogs, missing selected entries, and unknown angle references produce explicit errors instead of undefined; an invalid random sample also produces an explicit error. No dependencies, history, persistence, or repeat prevention are used. Prompt instructions request text in the chosen language and give explicit topic, format, angle, and level guidance. Volume for current prose formats uses the approved level profile via getTextLength; Japanese and Mandarin use relative length and structural instructions without numeric targets. Plus/minus CEFR choices are internal tuning points around standard levels rather than separate official levels. More complex topics or angles do not relax the selected language difficulty. The prompt is guidance to an external model; the app does not validate the generated text or guarantee its level or length. History and saved settings remain future stages. GitHub Pages publication is configured separately from those pending features. A separate local motion prototype uses the same Topic / Format / Angle contract.

## Zero-inference / static-only architecture

Design stage 2 was completed locally on October 10: separate study background, responsive burgundy chassis/deck, wheel, keycap and SPIN-face artwork, a layer manifest, generation prompts and a static responsive review are saved in [ASSETS.md](docs/design/ASSETS.md). The user accepted the simplified v2 reel movement as a basis. The static artwork review remains an appearance-only archive. Stage 3 integrates the artwork and motion in the main React UI, including all 19 decorative keys, sequential reels and button/wheel/key movement. The How to use dialog was subsequently implemented and localized; step 10 adds prompt-updated feedback and the full catalogs. See [IMPLEMENTATION.md](docs/design/IMPLEMENTATION.md) for verification and remaining limits. This does not update the public application.

- Ship all topics, formats, angles, compatibility rules, supporting style instructions, CEFR instructions, languages, and text-length presets with the project.
- Compose prompts entirely in the browser. No model runs inside the app, and no AI API is called.
- Serve only static build assets. No backend, database, authentication, server-side inference, or paid external service.
- No external fonts, remote data loading, analytics, or API integrations in this foundation.
- Publish the static starter application on GitHub Pages through the verified build workflow; see [DEPLOYMENT.md](docs/DEPLOYMENT.md). Publication was authorized on October 9, 2026 and does not mark planned catalog or design work as implemented.

## Tech stack and structure

React + TypeScript + Vite, ordinary CSS, and pnpm with a committed lockfile.

```text
src/
  components/  Reusable UI components
  data/        Static product catalogs and instructions
  prompt/      Pure TypeScript prompt composition
  random/      UI-independent random combination selection
  types/       Shared domain types
  App.tsx      Single-screen composition and local React state
  App.css      Screen layout
  index.css    Global styles
  main.tsx     React entry point
public/        Static assets
```

Use React state for current selections. Keep prompt logic independent of React and browser APIs. Prefer adding a small explicit module over introducing a framework or a generic abstraction.

## Architectural boundaries

Do not add routing, state-management libraries, UI frameworks, test frameworks, Docker, authentication, tracking, or external service integrations without a new project requirement. The authorized Pages workflow checks and publishes main without writing repository contents; deployment permissions are scoped to its deploy job. No application credentials or API keys are needed. Preserve the static-only architecture as features grow.

The interface and prompt instructions use English or Russian, independently of the reading language. English is the first-visit default. The requested reading text uses the selected language. The [eleven-language catalog](docs/LANGUAGES.md) restores the original request; the full canonical topic, format and angle catalogs are connected locally.

Local EN/RU implementation and verification are documented in [docs/localization](docs/localization/README.md), including [switcher design](docs/design/LOCALIZATION_EN_RU.md). The interface locale is committed with the prompt snapshot and determines instruction/vocabulary-meaning language; the switch rebuilds the same combination without selection. Static typed resources live in src/i18n; numeric/domain rules remain canonical. Browser storage is used only for the explicit locale preference. The implementation is saved in local Git history; it has not been pushed or published.
