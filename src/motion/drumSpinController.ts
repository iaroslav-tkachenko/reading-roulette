import { buildPrompt } from '../prompt/buildPrompt'
import { selectReadingCombination } from '../random/selectReadingCombination'
import { prepareSvgDrums } from './svgDrumMotion'
import type { PreparedDrum } from './svgDrumMotion'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

export interface ReadingSnapshot {
  settings: ReadingSettings
  combination: ReadingCombination
  prompt: string
  revision: number
  spinCount: number
}
export interface DrumSpinRun {
  id: number
  from: ReadingSnapshot
  to: ReadingSnapshot
  drums: PreparedDrum[]
}
export interface DrumSpinState {
  snapshot: ReadingSnapshot
  run: DrumSpinRun | null
  error: string
}

// Owns the synchronous lock and prepared transaction, independent of animation callbacks.
export function createDrumSpinController(
  initial: ReadingSnapshot,
  notify: (state: DrumSpinState) => void,
  select = selectReadingCombination,
  build = buildPrompt,
) {
  let state: DrumSpinState = { snapshot: initial, run: null, error: '' }
  let active = true
  let preparing = false
  let sequence = 0
  const publish = (next: DrumSpinState) => { state = next; if (active) notify(state) }
  const finish = (id: number) => {
    if (!active || state.run?.id !== id) return
    publish({ snapshot: state.run.to, run: null, error: '' })
  }
  return {
    getState: () => state,
    isBusy: () => preparing || state.run !== null,
    resume() { active = true },
    dispose() { active = false },
    finish,
    finishCurrent() { if (state.run) finish(state.run.id) },
    start(immediate = false) {
      if (!active || preparing || state.run) return
      preparing = true
      try {
        const from = state.snapshot
        const combination = select()
        const to = {
          settings: from.settings, combination, prompt: build(from.settings, combination),
          revision: from.revision + 1, spinCount: from.spinCount + 1,
        }
        const run = { id: ++sequence, from, to, drums: prepareSvgDrums(from.combination, combination, sequence) }
        publish(immediate ? { snapshot: to, run: null, error: '' } : { snapshot: from, run, error: '' })
      } catch {
        publish({ ...state, run: null, error: 'Could not prepare a reading prompt. Please try SPIN again.' })
      } finally { preparing = false }
    },
    changeSettings(settings: ReadingSettings) {
      if (!active || preparing || state.run) return
      try {
        const snapshot = { ...state.snapshot, settings, prompt: build(settings, state.snapshot.combination), revision: state.snapshot.revision + 1 }
        publish({ snapshot, run: null, error: '' })
      } catch {
        publish({ ...state, error: 'Could not update the reading settings. Please try again.' })
      }
    },
  }
}
