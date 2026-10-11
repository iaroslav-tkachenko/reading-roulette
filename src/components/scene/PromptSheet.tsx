import { artwork } from './artwork'
import { copyMessages } from '../../clipboard/promptCopier'
import { usePromptCopy } from '../../clipboard/usePromptCopy'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPromptUpdateFeedback } from '../../prompt/promptUpdateFeedback'

// Geometry and layer order preserved from the accepted v10 reference.
export function PromptSheet({prompt, disabled = false, revision = 0, updateCount = 0, spinning = false, error = ''}: {prompt: string; disabled?: boolean; revision?: number; updateCount?: number; spinning?: boolean; error?: string}) {
  const { status, copyPrompt } = usePromptCopy(prompt, disabled, revision)
  const [updated, setUpdated] = useState(false)
  const [feedback] = useState(() => createPromptUpdateFeedback(setUpdated))
  const previousUpdate = useRef(updateCount)
  useLayoutEffect(() => {
    const changed = updateCount !== previousUpdate.current
    previousUpdate.current = updateCount
    if (spinning || error || !prompt) feedback.cancel()
    else if (changed) feedback.show()
  }, [feedback, updateCount, spinning, error, prompt])
  useLayoutEffect(() => () => feedback.dispose(), [feedback])
  const pending = status === 'copying'
  const message = spinning ? 'Roulette is spinning… Copy will be available when it stops.' : disabled ? 'Press SPIN to prepare a valid prompt.' : copyMessages[status]
  return (
<section className="prompt-sheet" data-layer="output-paper" aria-labelledby="prompt-heading" data-prompt-updated={updated}>
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
<span key={updateCount} className="prompt-update-accent" data-layer="prompt-update-accent" aria-hidden="true" />
<div className="paper-header">
<h2 id="prompt-heading">Prompt preview<svg xmlns="http://www.w3.org/2000/svg" className="prompt-scroll-cue" data-layer="prompt-scroll-cue" viewBox="0 0 24 24" aria-hidden="true">
<path d="M12 4v16m-6-6 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
</h2>
<button className="copy-appearance" type="button" disabled={disabled} onClick={disabled ? undefined : copyPrompt} aria-controls="reading-prompt" aria-describedby="copy-status" aria-disabled={pending || disabled} aria-busy={pending || disabled} title={!disabled && status === 'idle' ? 'Copy the full prompt' : message}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" aria-hidden="true">
{status === 'success' ? (
<path d="m5 14 6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
) : status === 'error' ? (
<g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
<circle cx="14" cy="14" r="11" /><path d="M14 7v8m0 5v.1" />
</g>
) : (
<g fill="none" stroke="currentColor" strokeWidth="2">
<rect x="4" y="8" width="17" height="17" rx="3"/>
<path d="M9 3h14q3 0 3 3v14"/>
</g>
)}
</svg>Copy prompt</button>
</div>
<p className="prompt-update" role="status" aria-live="polite" aria-atomic="true">
  <span className="prompt-update-reserve" aria-hidden="true">✓ Prompt updated</span>
  <span>{updated && <><span aria-hidden="true">✓ </span>Prompt updated</>}</span>
</p>
<p id="copy-status" className="paste-hint copy-feedback" role="status" aria-live="polite" aria-atomic="true" data-copy-status={status}>
  <span className="copy-feedback-reserve" aria-hidden="true">{copyMessages.error}</span>
  <span className="copy-feedback-message">{message}</span>
</p>
{error && <p className="reading-error" role="status" aria-live="polite">{error}</p>}
<pre id="reading-prompt" className="real-prompt" data-layer="real-prompt">{prompt || 'Press SPIN to prepare a text for these settings.'}</pre>
</div>
</section>
  )
}
