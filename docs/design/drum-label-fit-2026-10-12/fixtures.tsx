import { createRoot } from 'react-dom/client'
import { DrumLabel } from '../../../src/components/scene/DrumLabel'
import { MachineScene } from '../../../src/components/scene/MachineScene'
import { LocaleContext } from '../../../src/i18n/LocaleContext'
import { topics } from '../../../src/data/topics'
import { formats } from '../../../src/data/formats'
import { angles } from '../../../src/data/angles'
import { catalogLabel } from '../../../src/i18n/catalogs.ru'
import { initialCombination, initialSettings } from '../../../src/components/scene/initialReading'
import '../../../src/App.css'

const examples = [
  ['Nature & wildlife', 'Personal letter', 'A request for help'],
  ['Money & personal finance', 'Speech', 'Decisions and next steps'],
  ['Hobbies & leisure', 'Opinion column', 'Consequences of a decision'],
  ['Technology & digital life', 'Comparative review', 'Strengths and limitations'],
  ['Health & wellbeing', 'Picture story', 'A change of plans'],
  ['Society & public life', 'Speech', 'A special occasion'],
]

createRoot(document.getElementById('fixtures')!).render(<>
  <svg id="all-labels" style={{ position: 'absolute', visibility: 'hidden', fontFamily: 'Georgia,"Times New Roman",serif' }}>
    {(['en', 'ru'] as const).flatMap(locale => [...topics, ...formats, ...angles].flatMap(item =>
      [{ selected: true, compact: false }, { selected: false, compact: false }, { selected: true, compact: true }].map(props =>
        <g key={locale + item.id + props.selected + props.compact} data-locale={locale} data-compact={props.compact} data-angle={angles.some(a => a.id === item.id)} style={{ fontWeight: props.selected ? 700 : 400 }}>
          <DrumLabel {...props} label={catalogLabel(item, locale)} x={0} y={0} angle={angles.some(a => a.id === item.id)} />
        </g>)))}
  </svg>
  {examples.map((labels, i) => <div key={i} className="fixture-scene reading-scene" style={{ width: 1536, minHeight: 0, padding: 0 }}>
    <LocaleContext value="en"><main className="scene-artboard">
      <MachineScene settings={initialSettings} combination={{
        ...initialCombination,
        topic: { ...initialCombination.topic, label: labels[0] },
        format: { ...initialCombination.format, label: labels[1] },
        angle: { ...initialCombination.angle, label: labels[2] },
      }} onSettingsChange={() => {}} onSpin={() => {}} />
    </main></LocaleContext>
  </div>)}
</>)
