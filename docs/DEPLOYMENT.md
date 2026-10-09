# Reading Roulette — publication and deployment

The user authorized GitHub push and publication on October 9, 2026, after approving the catalog decisions. Earlier instructions to keep planning changes local applied before this authorization. Publication ships the current starter application and the approved documentation; it does not implement the full catalogs or final design.

Repository: [iaroslav-tkachenko/reading-roulette](https://github.com/iaroslav-tkachenko/reading-roulette).

Website: [Reading Roulette](https://iaroslav-tkachenko.github.io/reading-roulette/).

Workflow: [Verify and deploy GitHub Pages](../.github/workflows/pages.yml). It runs on pushes to main and on manual dispatch. Actions are pinned to verified commit SHAs. Node.js 24 and the pnpm version in package.json build the committed lockfile.

## Release checks

The build job installs locked dependencies, audits approved Markdown metadata, verifies starter selection/prompt behavior, checks the local motion prototype's TypeScript, and builds the main application. Deployment depends on that build job. Only the deploy job receives pages:write and id-token:write; repository contents remain read-only for the workflow.

Pages uses the GitHub Actions publishing source. This project site is served under `/reading-roulette/`, so CI builds with:

```powershell
pnpm build --base=/reading-roulette/
```

Local development still uses the default `/` base. No custom domain, backend, inference API, runtime credentials, or paid service is introduced. The separate motion HTML remains a local development prototype and is not included in the production artifact.

The deployed `release.json` contains the public Git commit SHA. After a deployment, compare that SHA with the successful Actions run and main, then check the HTML, referenced JavaScript/CSS, and favicon. An HTTP 200 does not confirm browser interaction, clipboard access, visual layout, accessibility, or actual generated texts.

## Repeatable local checks

```powershell
node docs/validation/audit-catalogs.mjs
node docs/validation/audit-starter-runtime.mjs
pnpm typecheck
pnpm exec tsc --ignoreConfig --noEmit --strict --noUnusedLocals --noUnusedParameters --target es2023 --lib es2023,dom --module esnext --moduleResolution bundler --types vite/client --skipLibCheck docs/design/motion-preview/preview.ts
pnpm build --base=/reading-roulette/
git diff --check
```

The two audit scripts update local JSON evidence. Their scopes are documented: metadata and authored examples for the full approved catalogs; selection and prompts for the small implemented starter catalogs. Neither validates the complete future semantic allowlist or external model output.

## Documentation and publication state

Current behavior and pending requirements are distinguished in [README.md](../README.md), [PROJECT.md](../PROJECT.md), and [CATALOG_VALIDATION.md](CATALOG_VALIDATION.md). The catalog audit is a historical pre-publication review; later deployment does not retroactively expand its test coverage. Images in docs/design/final are historical visual references, including the superseded Tone label, rather than screenshots of the deployed Angle UI.

Publishing should use a normal commit/push, preserve existing history, and wait for successful deployment. A failed build must not be bypassed by deploying an unverified artifact. Fixes use new commits; no force push or history rewrite is needed.

## Sources and verification record

The project-base path and Actions deployment approach follow the [Vite static deployment guide](https://vite.dev/guide/static-deploy.html#github-pages). Workflow permissions, environment, artifact upload and deployment follow [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Action revisions were resolved from the official GitHub repositories before configuring this workflow.

Publication verification will be recorded here after the first successful deployment. Interactive browser verification remains subject to availability of the in-app Browser; a connection failure does not count as a passing browser check.
