import { LocaleContext } from './i18n/LocaleContext'
import { translate } from './i18n/locale'
import { catalogLabel } from './i18n/catalogs.ru'
import { failureMessage } from './types/readingFailure'
import { InterfaceLanguageSelect } from './components/InterfaceLanguageSelect'
import { useRef, useState } from 'react'
import { HelpButton } from './components/HelpButton'
import { HowToUse } from './components/HowToUse'
import { MachineScene } from './components/scene/MachineScene'
import { RoomBackdrop } from './components/scene/RoomBackdrop'
import { PromptSheet } from './components/scene/PromptSheet'
import { useDrumSpin } from './motion/useDrumSpin'
import { useCompactScene } from './components/scene/useCompactScene'
import './App.css'

function App() {
  const [helpOpen, setHelpOpen] = useState(false)
  const helpButtonRef = useRef<HTMLButtonElement>(null)
  const compact = useCompactScene()
  const { snapshot, run, error, failure, spin, changeSettings, changeInterfaceLocale, finish } = useDrumSpin()
  const { settings, combination, prompt, revision, spinCount, updateCount } = snapshot

  const locale = snapshot.interfaceLocale ?? 'en'
  const t = (key: Parameters<typeof translate>[1], params = {}) => translate(locale, key, params)
  return (
    <LocaleContext value={locale}>
    <div className="reading-scene" data-design-revision="v10" data-stage="full-catalogs" data-spinning={!!run} data-locale={locale}>
      <RoomBackdrop />
      <main className="scene-artboard">
        <h1 className="sr-only">Reading Roulette</h1>
        <div className="scene-actions">
          <HelpButton buttonRef={helpButtonRef} expanded={helpOpen} onClick={() => setHelpOpen(true)} />
          <InterfaceLanguageSelect busy={!!run} closeSignal={String(helpOpen) + ':' + String(compact)} onChange={changeInterfaceLocale} />
        </div>
        <MachineScene compact={compact} settings={settings} combination={combination} onSettingsChange={changeSettings} onSpin={spin} run={run} onSpinComplete={finish} />
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {run ? t('spin.wait') : combination && spinCount > 0 ? t('spin.result', { count: spinCount, topic: catalogLabel(combination.topic, locale), format: catalogLabel(combination.format, locale), angle: catalogLabel(combination.angle, locale) }) : ''}
        </p>
        <PromptSheet prompt={prompt} disabled={!!run || !combination} revision={revision} updateCount={updateCount ?? 0} spinning={!!run} error={failure ? failureMessage(failure, locale) : error} />
      </main>
      <HowToUse open={helpOpen} onClose={() => setHelpOpen(false)} returnFocusRef={helpButtonRef} />
    </div>
    </LocaleContext>
  )
}

export default App
