import { MachineScene } from './components/scene/MachineScene'
import { RoomBackdrop } from './components/scene/RoomBackdrop'
import { PromptSheet } from './components/scene/PromptSheet'
import { initialPrompt } from './components/scene/initialReading'
import './App.css'

function App() {
  return (
    <div className="reading-scene" data-design-revision="v10" data-stage="static">
      <RoomBackdrop />
      <main className="scene-artboard">
        <h1 className="sr-only">Reading Roulette</h1>
        <MachineScene />
        <PromptSheet prompt={initialPrompt} />
      </main>
    </div>
  )
}

export default App
