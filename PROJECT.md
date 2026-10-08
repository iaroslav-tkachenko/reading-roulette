# Reading Roulette

## Product goal

Reading Roulette is a static web application for foreign-language learners. It helps users find fresh reading ideas and prepare a ready-to-use prompt for ChatGPT, Claude, Gemini, or another LLM chat. The user generates the reading text outside the application.

## User settings

- **Language:** the language of the requested reading text.
- **CEFR Level:** A1, A1+, A2-, A2, A2+, B1-, B1, B1+, B2-, B2, B2+, C1-, C1, C1+, C2.
- **Text Length:** initially Short (100–150 words), Medium (250–350), or Long (500–700). These ranges are starter product choices and may be revised.

The plus/minus variants are internal difficulty tuning labels around the six standard CEFR levels. Their instructions guide the external LLM; the app cannot guarantee the generated text's actual proficiency level.

## Topic × Format × Tone

The primary interaction is **SPIN**, which independently selects one item from each static catalog: **Topic**, **Format**, and **Tone**. Repeating a previous combination is allowed. Together with the user settings, this combination becomes a prompt assembled locally with ordinary TypeScript. Users can then use it in their preferred LLM chat.

The screen starts with a fixed starter combination and a live prompt preview. Pressing SPIN updates the combination and its prompt together. Changing Language, CEFR Level, or Text Length updates the prompt while preserving the selected combination. Selection happens only on button activation, not during rendering. The button supports keyboard activation and visible focus, and the result is announced politely to assistive technology.

Random selection is a separate typed TypeScript function. Empty catalogs or missing selected entries produce explicit errors instead of undefined; an invalid random sample also produces an explicit error. No dependencies, history, persistence, or repeat prevention are used. Animated reels and a dedicated Copy prompt action remain future stages.

## Zero-inference / static-only architecture

- Ship all topics, formats, tones, CEFR instructions, languages, and text-length presets with the project.
- Compose prompts entirely in the browser. No model runs inside the app, and no AI API is called.
- Serve only static build assets. No backend, database, authentication, server-side inference, or paid external service.
- No external fonts, remote data loading, analytics, or API integrations in this foundation.
- Keep the project suitable for free static hosting on GitHub Pages. Hosting configuration and deployment are a separate stage.

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

Do not add routing, state-management libraries, UI frameworks, test frameworks, Docker, CI/CD, GitHub Pages configuration, authentication, tracking, or external service integrations without a new project requirement. No credentials or API keys are needed. Preserve the static-only architecture as features grow.

The starter interface and prompt instructions use English. The requested reading text uses the selected language. Language catalogs and content catalogs are intentionally small initial examples.
