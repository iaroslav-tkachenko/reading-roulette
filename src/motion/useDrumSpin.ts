import { readLocalePreference, saveLocalePreference, translate } from '../i18n/locale'
import type { InterfaceLocale } from '../i18n/locale'
import { useEffect, useState } from 'react'
import { initialCombination, initialSettings } from '../components/scene/initialReading'
import { buildPrompt } from '../prompt/buildPrompt'
import { createDrumSpinController } from './drumSpinController'
import type { DrumSpinState } from './drumSpinController'

export function useDrumSpin() {
  const [state, setState] = useState<DrumSpinState>(() => {
    const interfaceLocale = readLocalePreference()
    return { snapshot: { interfaceLocale, settings: initialSettings, combination: initialCombination, prompt: buildPrompt(initialSettings, initialCombination, interfaceLocale), revision: 0, spinCount: 0 }, run: null, error: '' }
  })
  const [controller] = useState(() => createDrumSpinController(state.snapshot, setState))

  useEffect(() => {
    controller.resume()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = window.innerWidth
    let height = window.innerHeight
    const hide = () => { if (document.hidden) controller.finishCurrent() }
    const reduce = () => { if (motion.matches) controller.finishCurrent() }
    const resize = () => {
      const nextWidth = window.innerWidth
      const nextHeight = window.innerHeight
      if (Math.abs(nextWidth - width) >= 2 || Math.abs(nextHeight - height) >= 2) {
        width = nextWidth
        height = nextHeight
        controller.finishCurrent()
      }
    }
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', controller.finishCurrent)
    document.addEventListener('visibilitychange', hide)
    motion.addEventListener('change', reduce)
    return () => {
      controller.dispose()
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', controller.finishCurrent)
      document.removeEventListener('visibilitychange', hide)
      motion.removeEventListener('change', reduce)
    }
  }, [controller])

  const locale = state.snapshot.interfaceLocale ?? 'en'
  useEffect(() => {
    document.documentElement.lang = locale
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(locale, 'page.description'))
  }, [locale])
  function changeInterfaceLocale(next: InterfaceLocale) {
    if (controller.changeInterfaceLocale(next)) saveLocalePreference(next)
  }

  function spin() {
    const immediate = document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof SVGElement.prototype.animate !== 'function'
    controller.start(immediate)
  }

  return { ...state, spin, changeInterfaceLocale, changeSettings: controller.changeSettings, finish: controller.finish }
}
