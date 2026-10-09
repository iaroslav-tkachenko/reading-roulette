# Reading Roulette

## Product goal

Reading Roulette is a static web application for foreign-language learners. It helps users find fresh reading ideas and prepare a ready-to-use prompt for ChatGPT, Claude, Gemini, or another LLM chat. The user generates the reading text outside the application.

## User settings

- **Language:** the language of the requested reading text.
- **CEFR Level:** A1, A1+, A2-, A2, A2+, B1-, B1, B1+, B2-, B2, B2+, C1-, C1, C1+, C2.
- **Text Length:** Short / Medium / Long. Approved [level/length rules](docs/LEVELS_LENGTH.md) define profile-dependent word ranges, format-specific fields/items, and a length matrix for all 44 formats. The current starter code still uses 100–150 / 250–350 / 500–700 words for every level and format.

The plus/minus variants are internal difficulty tuning labels around the six standard CEFR levels. Their instructions guide the external LLM; the app cannot guarantee the generated text's actual proficiency level.

## Topic × Format × Angle

The mandatory product contract, approved on October 9, 2026, is **Topic × Format × Angle**. All application UI, motion prototypes, prompt composition, catalog authoring, and future design work must follow the approved [content catalog principles](docs/CATALOGS.md). Angle is the specific question, situation, or idea explored by the text. It replaces the former Tone reel. Register, emotional tone, genre, narrative perspective, and text structure are supporting instructions within suitable formats and angles; they are not additional controls or independently randomized choices. Older PNGs and archived generation prompts retain the former Tone label as historical visual references, not current product requirements.

The primary interaction is **SPIN**: select a Topic, select a Format, then select an Angle from that format's explicitly compatible entries. Repeating a previous combination is allowed. The three results are displayed together and become a prompt assembled locally with ordinary TypeScript. Users can then use it in their preferred LLM chat. Selection is not a Cartesian product of three independent catalogs. The current starter entries demonstrate this contract. Six reading families and level-dependent weights are approved in [READING_FAMILIES.md](docs/READING_FAMILIES.md), including 30% visual reading at A1. The agreed 26-topic inventory, minimum content profiles, and required beginner restrictions are in [TOPICS.md](docs/TOPICS.md). The agreed 44-format inventory, characteristic structures, family membership, minimum profiles, register, and perspective are in [FORMATS.md](docs/FORMATS.md). News briefs and reportage require actual source discovery and reading in the external AI chat, with source links in the result and no invented facts, quotations, or eyewitness details. Speeches and IT meeting follow-ups are also included. The agreed 30-angle inventory, five groups of six, minimum content profiles, and compatibility rules are in [ANGLES.md](docs/ANGLES.md). Short general labels appear on the reel; the prompt specifies the situation for the selected topic and format. Group sizes do not define selection probabilities. These weights, the full catalogs and eligibility filters, per-format level/length rules, sourced-news prompts, and visual-output prompt templates are required future behavior and are not yet implemented. The approved [level/length rules](docs/LEVELS_LENGTH.md) define profile-dependent ranges, the 44-format length matrix, preserving valid combinations, and clearing invalid results with an explicit SPIN. After a valid settings change actually alters the prompt, update the text immediately and show a checkmark with Prompt updated for 1600 ms, plus a 120 ms accent and 240 ms return on the preview border/background. Keep Copy available and reduced motion static; cancel outdated effects and clipboard messages by revision. These rules and feedback remain future implementation work. The approved [four content statuses](docs/CONTENT_STATUS.md) define fiction, training scenarios, factual material, and source-based material, with complete format coverage, required labels, and clearly marked partial visual output when image creation is unavailable. The [system audit](docs/CATALOG_VALIDATION.md) records completed checks, edge cases, and remaining implementation work.

For animated SPIN, prepare the complete valid combination and prompt once before motion starts. Local compatibility filtering must not depend on animation events: Angle does not wait for Topic or Format to stop. Keep the existing shared start and sequential stops from [MOTION.md](docs/design/MOTION.md), without a computation-related delay for the third reel. Reduced motion returns the result without an artificial wait. Handle an empty valid set before starting a successful-result animation; measure full-catalog filtering performance during implementation rather than using animation duration as a computation budget.

The screen starts with a fixed starter combination and a live prompt preview. Pressing SPIN updates the combination and its prompt together. Changing Language, CEFR Level, or Text Length updates the prompt while preserving the selected combination. Selection happens only on button activation, not during rendering. SPIN supports keyboard activation and visible focus, and the result is announced politely to assistive technology. Copy prompt copies the full current preview after an explicit button activation using the browser Clipboard API. A result is announced only for the exact prompt copied; if copying is unavailable or rejected, the user is told to select and copy the readable preview manually.

Random selection is a separate typed TypeScript function. Empty catalogs, missing selected entries, and unknown angle references produce explicit errors instead of undefined; an invalid random sample also produces an explicit error. No dependencies, history, persistence, or repeat prevention are used. Prompt instructions request text in the chosen language, use the selected static word range, and give explicit topic, format, angle, and level guidance. Plus/minus CEFR choices are internal tuning points around standard levels rather than separate official levels. More complex topics or angles do not relax the selected language difficulty. The prompt is guidance to an external model; the app does not validate the generated text or guarantee its level or length. Animated reels in the main application, history, and saved settings remain future stages. GitHub Pages publication is configured separately from those pending features. A separate local motion prototype uses the same Topic / Format / Angle contract.

## Zero-inference / static-only architecture

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

The starter interface and prompt instructions use English. The requested reading text uses the selected language. Language catalogs and content catalogs are intentionally small initial examples.
