import { useState } from 'react'
import { ReadingSettingsForm } from './components/ReadingSettingsForm'
import { formats } from './data/formats'
import { languages } from './data/languages'
import { tones } from './data/tones'
import { topics } from './data/topics'
import { buildPrompt } from './prompt/buildPrompt'
import type { ReadingCombination, ReadingSettings } from './types/reading'
import './App.css'

const starterCombination: ReadingCombination = {
  topic: topics[0],
  format: formats[0],
  tone: tones[0],
}

function App() {
  const [settings, setSettings] = useState<ReadingSettings>({
    language: languages[0],
    cefrLevel: 'A2',
    textLength: 'short',
  })

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
        <h2 id="combination-heading">Starter combination</h2>
        <p className="section-note">A fixed example to get started. Spinning the reels comes next.</p>
        <dl className="combination-grid">
          <div><dt>Topic</dt><dd>{starterCombination.topic.label}</dd></div>
          <div><dt>Format</dt><dd>{starterCombination.format.label}</dd></div>
          <div><dt>Tone</dt><dd>{starterCombination.tone.label}</dd></div>
        </dl>
      </section>

      <section className="panel" aria-labelledby="prompt-heading">
        <h2 id="prompt-heading">Prompt preview</h2>
        <p className="section-note">Use this prompt in your preferred AI chat to create the reading text.</p>
        <label className="sr-only" htmlFor="prompt-preview">Generated reading prompt</label>
        <textarea id="prompt-preview" readOnly value={buildPrompt(settings, starterCombination)} />
      </section>
    </main>
  )
}

export default App
