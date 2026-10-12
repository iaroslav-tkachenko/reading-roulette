import { useState } from 'react'
import { MachineScene } from './components/scene/MachineScene'
import { RoomBackdrop } from './components/scene/RoomBackdrop'
import { PromptSheet } from './components/scene/PromptSheet'
import { initialCombination, initialSettings } from './components/scene/initialReading'
import { buildPrompt } from './prompt/buildPrompt'
import { selectReadingCombination } from './random/selectReadingCombination'
import './App.css'

function App() {
  const [settings, setSettings] = useState(initialSettings)
  const [result, setResult] = useState({ combination: initialCombination, revision: 0 })
  const { combination, revision } = result
  const prompt = buildPrompt(settings, combination)

  function handleSpin() {
    // Select once per activation, outside the state updater (also safe in StrictMode).
    const nextCombination = selectReadingCombination()
    setResult(previous => ({ combination: nextCombination, revision: previous.revision + 1 }))
  }

  return (
    <div className="reading-scene" data-design-revision="v10" data-stage="spin-press">
      <RoomBackdrop />
      <main className="scene-artboard">
        <h1 className="sr-only">Reading Roulette</h1>
        <MachineScene settings={settings} combination={combination} onSettingsChange={setSettings} onSpin={handleSpin} />
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {revision > 0 ? `Spin ${revision}: ${combination.topic.label}; ${combination.format.label}; ${combination.angle.label}. Prompt updated.` : ''}
        </p>
        <PromptSheet prompt={prompt} />
      </main>
    </div>
  )
}

export default App
