# Stage 2 static artwork review

2026-10-10. This directory reviews the prepared art, separately from the production application and interactive motion v2 prototype. No animation or product behavior is implemented here.

Run from the repository root:

```powershell
pnpm dev --host 127.0.0.1 --port 5173 --strictPort
```

- Normal composition: http://127.0.0.1:5173/docs/design/artwork-review/
- Long fixture: http://127.0.0.1:5173/docs/design/artwork-review/long-labels.html
- Individual PNGs: the Layer kit section on either page.
- Art-direction illustration: [assembly-illustration-v3.png](assembly-illustration-v3.png). This ImageGen mockup is not an exact asset composite or a browser screenshot. It restores the approved 19-key keyboard (QWERT/ASDFG left, YUIOP/HJKL right). The sparse v2 illustration is retained as a rejected historical variant.

Resize the window for mobile composition. SPIN, Copy and settings are appearances only. The actual layered composition uses native HTML/CSS and five self-contained SVG viewport wrappers around unmodified PNGs; the source gallery shows alpha against a checkerboard.

[ASSETS.md](../ASSETS.md) records crop viewports, stretch rules, layer order, future animation hooks and verification limits. Generation prompts and provenance are in [IMAGEGEN_PROMPTS.md](../assets/IMAGEGEN_PROMPTS.md). Rebuild wrappers/HTML with `node docs/design/artwork-review/build-review.mjs`. Read-only PNG inspection: `node docs/design/assets/inspect-assets.mjs`.

This source-art library is not a production asset-loading budget. Do not ship both PNG masters and the SVG wrappers that embed them. Optimize and browser-check during stage 3.

Completed checks and their limits: [VERIFICATION.md](VERIFICATION.md), [JSON](VERIFICATION.json).
