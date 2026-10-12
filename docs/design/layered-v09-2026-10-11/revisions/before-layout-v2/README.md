# Static layered reconstruction of original v09

Open the assembled page at:

http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/

Open the layer gallery at:

http://127.0.0.1:5173/docs/design/layered-v09-2026-10-11/layers.html

This is a separate static design proof requested on 2026-10-11. It contains no product interaction or animation. Existing React app, previous restoration attempt and previous artwork are preserved. There is no commit, publication or deployment as part of this proof.

## What was added

- Empty study background redrawn from the approved original `../references/reading-roulette-evening-study-v09.png`.
- Bare burgundy lower chassis with its front wall, paper slot and feet.
- Separate blank parchment settings panel and antique bronze surround.
- Open bronze mechanical cradle with three genuinely transparent apertures. Side wheels are separate.
- A blank cylindrical paper master, instantiated as three independent drum layers behind the cradle.
- A blank keycap master, instantiated as 19 separate key objects; each letter is separate SVG text.
- A side-view bronze wheel, instantiated twice; the right instance is mirrored.
- Separate stationary SPIN bezel and turquoise insert; SPIN lettering and arrow are independent.
- A separate blank output sheet with independent heading, prompt text, copy appearance and hint.
- Independent heading, ornament, subtitle, settings fields and static open help card.
- A local EB Garamond Bold font for the main heading and prompt heading, with its OFL license.
- The assembled HTML, standalone SVG, layer gallery, reproducible assembly script, placement manifest, ImageGen prompts, alpha inspection and verification report.

## Assembly

The scene uses inline SVG with a 1536 × 1024 coordinate system. Its 31 raster instances refer to 10 distinct PNG artwork files. Each raster uses a nested SVG viewBox to exclude transparent outer margins. Width and height share the same scale; PNG pixels and alpha are not modified. Typography and simple icons are actual SVG text and paths. The scene itself is composed in the page DOM; it does not reference the original screenshot or the flattened QA render.

The artboard fits the available window while preserving its 3:2 composition. This is an illustration review, not a completed responsive mobile product layout. Topic × Format × Angle is retained; the historical Tone label from the original reference is not restored. Prompt preview uses a longer sample suited to the current product contract.

All artwork was made with the built-in ImageGen tool using the original v09 as the edit/reference target, followed by targeted corrections. These are redrawn production layers, not pixel-exact cutouts from an original layered source. Details, lighting and perspective still differ from the original and need visual acceptance. Earlier variants remain alongside the selected assets, with no destructive replacements.

## Reproduce and check

```powershell
node docs/design/layered-v09-2026-10-11/inspect.mjs
node docs/design/layered-v09-2026-10-11/assemble.mjs
node docs/design/layered-v09-2026-10-11/verify.mjs
```

The verification checks the independent layers, transparent apertures, uniform scaling, resource paths and HTTP responses. The gallery uses inline SVG so external PNG artwork can load correctly; its SVG thumbnails are not nested inside HTML image elements.

`assembly-render.png` is an offline render of `scene.svg` with resvg, inspected visually during assembly. It is an output artifact only and is not used as the webpage design. The optional renderer is installed separately under the D: visualization workspace, outside this project's dependencies. To regenerate, pass that tooling directory containing `@resvg/resvg-js`:

```powershell
node docs/design/layered-v09-2026-10-11/render.mjs D:/Dev/CodexHome/visualizations/2026/10/11/01a12a63-3fb3-7ea0-afa4-5ad5a55ed974/renderer
```

Browser QA remains unverified: the in-app Browser failed while resolving `browser-client.mjs` with EPERM. No external browser was launched. HTTP 200 and the offline SVG render do not establish that browser layout and font loading have been checked. The local Vite server serves the actual static page; Vite may inject its development HMR client.

Font provenance: [Google Fonts EB Garamond source and OFL](https://github.com/google/fonts/tree/main/ofl/ebgaramond). The static 700 TTF was fetched through the Google Fonts CSS endpoint. Both the font and license are saved locally in `assets/`.
