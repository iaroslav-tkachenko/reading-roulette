# Reading Roulette — publication and deployment

The initial starter was published on October 9, 2026. The October 12 v10 release includes the full catalogs, approved scene, EN/RU interface and prompt localization, optimized artwork, and current documentation. The application remains entirely static.

Repository: [iaroslav-tkachenko/reading-roulette](https://github.com/iaroslav-tkachenko/reading-roulette).

Website: [Reading Roulette](https://iaroslav-tkachenko.github.io/reading-roulette/).

Workflow: [Verify and deploy GitHub Pages](../.github/workflows/pages.yml). It runs on pushes to main and on manual dispatch. Actions are pinned to verified commit SHAs. Node.js 24 and the pnpm version in package.json build the committed lockfile.

## v10 application release verification

The v10 application release was built from `main` commit `06e9c3a167c41260c9225a3688c081e9b02a1c6f`. Its [GitHub Actions run](https://github.com/iaroslav-tkachenko/reading-roulette/actions/runs/38276444762) completed successfully on October 12, 2026. Later documentation-only commits may run the same workflow without changing application behavior; the Actions page above shows subsequent runs.

## Release checks

The build job installs locked dependencies, audits approved Markdown metadata, verifies full-catalog selection and prompts, audits EN/RU localization, checks the local motion prototype's TypeScript, and builds the main application. Deployment depends on that build job. Only the deploy job receives pages:write and id-token:write; repository contents remain read-only for the workflow.

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
node docs/localization/verify.mjs
pnpm typecheck
pnpm exec tsc --ignoreConfig --noEmit --strict --noUnusedLocals --noUnusedParameters --target es2023 --lib es2023,dom --module esnext --moduleResolution bundler --types vite/client --skipLibCheck docs/design/motion-preview/preview.ts
pnpm build --base=/reading-roulette/
node docs/design/implementation-step9-v10/verify.mjs
git diff --check
```

The metadata audit checks the approved documents and catalog constraints. The runtime audit retains its historical filename but checks all 1,544,400 level/length/tuple cases, 134,550 available selection branches and 1,480,050 prompts, including state and clipboard transitions. The localization audit checks all UI keys, 419 translated catalog fields, 149,334 Russian prompts and 495 reading settings. The step 9 regression checks scene/mechanics behavior. These checks do not validate output produced by an external AI chat or replace browser verification.

## Documentation and publication state

Current behavior and verification limits are distinguished in [README.md](../README.md), [PROJECT.md](../PROJECT.md), and [CATALOG_VALIDATION.md](CATALOG_VALIDATION.md). The October 9 catalog audit is historical; later deployment does not retroactively expand its test coverage. Images in docs/design/final are historical visual references, including the superseded Tone label, rather than screenshots of the deployed Angle UI.

Publishing should use a normal commit/push, preserve existing history, and wait for successful deployment. A failed build must not be bypassed by deploying an unverified artifact. Fixes use new commits; no force push or history rewrite is needed.

## Sources and verification record

The project-base path and Actions deployment approach follow the [Vite static deployment guide](https://vite.dev/guide/static-deploy.html#github-pages). Workflow permissions, environment, artifact upload and deployment follow [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Action revisions were resolved from the official GitHub repositories before configuring this workflow.

Initial publication was verified on October 9, 2026 at 15:28 UTC:

- [Release commit 44fd22d](https://github.com/iaroslav-tkachenko/reading-roulette/commit/44fd22d5b733e3015a29c86c73ece4d8ac1cf639) reached main through a normal push.
- [Actions run 37951791942](https://github.com/iaroslav-tkachenko/reading-roulette/actions/runs/37951791942) passed the build and deployment jobs.
- Public release.json matched that exact commit; HTML, JavaScript, CSS, and favicon returned HTTP 200. All three assets matched the local production build by SHA-256. Details are in the [initial deployment audit](validation/deployment-audit-2026-10-09.json).
- GitHub README and content-status document blob SHAs matched the committed local files. The repository homepage points to the Pages site.
- Interactive browser verification could not run: loading the in-app Browser runtime failed with EPERM. Visual layout, keyboard, clipboard, and accessibility remain unverified after the Angle migration.

This is evidence for the initial release, rather than a claim that its commit remains the latest deployment. Subsequent pushes repeat the workflow; check the successful run and public release.json for the current revision. Publishing the documentation record itself does not change the application assets.
