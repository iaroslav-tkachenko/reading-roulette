import { MachineScene } from './components/scene/MachineScene'
import { RoomBackdrop } from './components/scene/RoomBackdrop'
import { PromptSheet } from './components/scene/PromptSheet'
import { useDrumSpin } from './motion/useDrumSpin'
import './App.css'

function App() {
  const { snapshot, run, error, spin, changeSettings, finish } = useDrumSpin()
  const { settings, combination, prompt, revision, spinCount } = snapshot

  return (
    <div className="reading-scene" data-design-revision="v10" data-stage="key-waves" data-spinning={!!run}>
      <RoomBackdrop />
      <main className="scene-artboard">
        <h1 className="sr-only">Reading Roulette</h1>
        <MachineScene settings={settings} combination={combination} onSettingsChange={changeSettings} onSpin={spin} run={run} onSpinComplete={finish} />
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {error || (run ? 'Roulette is spinning. Please wait for all three drums to stop.' : spinCount > 0 ? `Spin ${spinCount}: ${combination.topic.label}; ${combination.format.label}; ${combination.angle.label}. Prompt updated.` : '')}
        </p>
        <PromptSheet prompt={prompt} disabled={!!run} revision={revision} />
      </main>
    </div>
  )
}

export default App
