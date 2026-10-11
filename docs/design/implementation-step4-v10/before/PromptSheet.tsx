import { artwork } from './artwork'

// Geometry and layer order preserved from the accepted v10 reference.
export function PromptSheet({prompt}: {prompt: string}) {
  return (
<section className="prompt-sheet" data-layer="output-paper" aria-labelledby="prompt-heading">
<svg xmlns="http://www.w3.org/2000/svg" className="paper-fill" data-layer="paper-texture" aria-hidden="true">
<defs>
<pattern id="html-paper-grain" width="1200" height="300" patternUnits="userSpaceOnUse">
<svg width="1200" height="300" viewBox="600 250 1000 250">
<image href={artwork['paper-v1.png']} width="2132" height="738"/>
</svg>
</pattern>
<linearGradient id="html-paper-grain-entry" x2="0" y2="1">
<stop stopColor="#241006" stopOpacity=".45"/>
<stop offset="1" stopColor="#241006" stopOpacity="0"/>
</linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#html-paper-grain)"/>
<rect width="100%" height="12" fill="url(#html-paper-grain-entry)" data-layer="paper-entry-shadow"/>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" className="paper-tear" data-layer="paper-torn-edge" viewBox="38 525 2052 67" aria-hidden="true">
<image href={artwork['paper-v1.png']} width="2132" height="738"/>
</svg>
<div className="paper-content">
<div className="paper-header">
<h2 id="prompt-heading">Prompt preview<svg xmlns="http://www.w3.org/2000/svg" className="prompt-scroll-cue" data-layer="prompt-scroll-cue" viewBox="0 0 24 24" aria-hidden="true">
<path d="M12 4v16m-6-6 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
</h2>
<span className="copy-appearance">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" aria-hidden="true">
<g fill="none" stroke="currentColor" strokeWidth="2">
<rect x="4" y="8" width="17" height="17" rx="3"/>
<path d="M9 3h14q3 0 3 3v14"/>
</g>
</svg>Copy prompt</span>
</div>
<pre className="real-prompt" data-layer="real-prompt">{prompt}</pre>
<p className="paste-hint">Paste into your preferred AI chat.</p>
</div>
</section>
  )
}
