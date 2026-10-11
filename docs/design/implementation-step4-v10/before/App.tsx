import { useState } from 'react'
import { MachineScene } from './components/scene/MachineScene'
import { RoomBackdrop } from './components/scene/RoomBackdrop'
import { PromptSheet } from './components/scene/PromptSheet'
import { initialCombination, initialSettings } from './components/scene/initialReading'
import { buildPrompt } from './prompt/buildPrompt'
import './App.css'

function App() {
  const [settings, setSettings] = useState(initialSettings)
  const prompt = buildPrompt(settings, initialCombination)

  return (
    <div className="reading-scene" data-design-revision="v10" data-stage="settings">
      <RoomBackdrop />
      <main className="scene-artboard">
        <h1 className="sr-only">Reading Roulette</h1>
        <MachineScene settings={settings} onSettingsChange={setSettings} />
        <PromptSheet prompt={prompt} />
      </main>
    </div>
  )
}

export default App
