import { useEffect, useState } from 'react'
import { ReadingSettingsForm } from './components/ReadingSettingsForm'
import { formats } from './data/formats'
import { languages } from './data/languages'
import { tones } from './data/tones'
import { topics } from './data/topics'
import { buildPrompt } from './prompt/buildPrompt'
import { selectReadingCombination } from './random/selectReadingCombination'
import type { ReadingCombination, ReadingSettings } from './types/reading'
import './App.css'

const starterCombination: ReadingCombination = {
  topic: topics[0],
  format: formats[0],
  tone: tones[0],
}

function App() {
  const [combination, setCombination] = useState<ReadingCombination>(starterCombination)
  const [settings, setSettings] = useState<ReadingSettings>({
    language: languages[0],
    cefrLevel: 'A2',
    textLength: 'short',
  })
  const [copyStatus, setCopyStatus] = useState<{ prompt: string; kind: 'success' | 'error' } | null>(null)
  const prompt = buildPrompt(settings, combination)

  useEffect(() => {
    setCopyStatus(null)
  }, [prompt])

  async function copyPrompt() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(prompt)
      setCopyStatus({ prompt, kind: 'success' })
    } catch {
      setCopyStatus({ prompt, kind: 'error' })
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">A little reading. A new possibility.</p>
        <h1>Reading Roulette</h1>
        <p className="intro">Choose your language, set your pace, and find something new to read.</p>
      </header>

      <section className="panel" aria-labelledby="settings-heading">
        <h2 id="settings-heading">Your reading preferences</h2>
        <ReadingSettingsForm settings={settings} onChange={setSettings} />
      </section>

      <section className="panel" aria-labelledby="combination-heading">
        <h2 id="combination-heading">Your reading combination</h2>
        <p className="section-note" id="spin-description">Start with this combination or press SPIN to randomly choose a topic, format, and tone. Repeats are possible.</p>
        <dl className="combination-grid" aria-live="polite" aria-atomic="true">
          <div><dt>Topic</dt><dd>{combination.topic.label}</dd></div>
          <div><dt>Format</dt><dd>{combination.format.label}</dd></div>
          <div><dt>Tone</dt><dd>{combination.tone.label}</dd></div>
        </dl>
        <button
          className="spin-button"
          type="button"
          aria-describedby="spin-description"
          onClick={() => setCombination(selectReadingCombination())}
        >
          SPIN
        </button>
      </section>

      <section className="panel" aria-labelledby="prompt-heading">
        <h2 id="prompt-heading">Prompt preview</h2>
        <p className="section-note">Use this prompt in your preferred AI chat to create the reading text.</p>
        <div className="prompt-actions">
          <button className="copy-button" type="button" onClick={copyPrompt}>Copy prompt</button>
          <p className="copy-status" aria-live="polite" aria-atomic="true">
            {copyStatus?.prompt === prompt
              ? copyStatus.kind === 'success'
                ? 'Prompt copied. Paste it into your AI chat.'
                : 'Could not copy automatically. Select the prompt below and copy it manually.'
              : ''}
          </p>
        </div>
        <label className="sr-only" htmlFor="prompt-preview">Generated reading prompt</label>
        <textarea id="prompt-preview" readOnly value={prompt} />
      </section>
    </main>
  )
}

export default App
