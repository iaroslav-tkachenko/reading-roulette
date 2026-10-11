import { buildPrompt } from '../prompt/buildPrompt'
import { selectReadingCombination } from '../random/selectReadingCombination'
import { checkCombination, validateSettings } from '../random/compatibility'
import { prepareSvgDrums } from './svgDrumMotion'
import type { PreparedDrum } from './svgDrumMotion'
import type { ReadingCombination, ReadingSettings } from '../types/reading'

export interface ReadingSnapshot {
  settings: ReadingSettings
  combination: ReadingCombination | null
  prompt: string
  revision: number
  spinCount: number
  updateCount?: number
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
        const combination = select(from.settings)
        const to = {
          settings: from.settings, combination, prompt: build(from.settings, combination),
          revision: from.revision + 1, spinCount: from.spinCount + 1,
          updateCount: from.updateCount ?? 0,
        }
        const run = { id: ++sequence, from, to, drums: prepareSvgDrums(from.combination, combination, sequence, from.settings) }
        publish(immediate ? { snapshot: to, run: null, error: '' } : { snapshot: from, run, error: '' })
      } catch (error) {
        publish({ ...state, run: null, error: `Could not prepare a reading prompt. ${error instanceof Error ? error.message + ' ' : ''}Please try SPIN again.` })
      } finally { preparing = false }
    },
    changeSettings(settings: ReadingSettings) {
      if (!active || preparing || state.run) return
      try {
        settings = validateSettings(settings)
        const previous = state.snapshot
        if (previous.settings.language.code === settings.language.code && previous.settings.cefrLevel === settings.cefrLevel && previous.settings.textLength === settings.textLength) return
        const checked = previous.combination ? checkCombination(settings, previous.combination) : null
        const combination = checked?.valid ? checked.combination : null
        const prompt = combination ? build(settings, combination) : ''
        const snapshot = { ...previous, settings, combination, prompt, revision: previous.revision + 1, updateCount: (previous.updateCount ?? 0) + (prompt && prompt !== previous.prompt ? 1 : 0) }
        publish({ snapshot, run: null, error: checked && !checked.valid ? checked.reason : combination ? '' : 'Press SPIN to find a text for these settings.' })
      } catch (error) {
        publish({ snapshot: { ...state.snapshot, combination: null, prompt: '', revision: state.snapshot.revision + 1 }, run: null, error: error instanceof Error ? error.message : 'Could not update the reading settings. Please press SPIN again.' })
      }
    },
  }
}
