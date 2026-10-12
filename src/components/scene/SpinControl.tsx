import { useLocale } from '../../i18n/LocaleContext'
import { artwork } from './artwork'
import { useSpinPress } from '../../motion/useSpinPress'

// The brass housing and native hit target stay fixed. Only the turquoise face moves.
export function SpinControl({ onSpin, busy = false }: { onSpin: () => void; busy?: boolean }) {
  const { t } = useLocale()
  const { pressed, handlers } = useSpinPress(onSpin, busy)
  return (
    <g id="spin-mechanism" className="spin-mechanism" data-layer="spin-mechanism" data-pressed={pressed}>
      <defs>
        <clipPath id="spin-face-aperture">
          <path d="M675 610H895C913 610 922 619 923 635L924 653Q924 668 906 668H664Q645 668 647 653L648 635Q650 610 675 610Z" />
        </clipPath>
      </defs>
      <g id="spin-button" data-layer="spin-button">
        <svg x="635" y="605" width="298" height="87.638" viewBox="88 77 1962 577" overflow="hidden">
          <image href={artwork['spin-button-v3.png']} width="2140" height="735" />
        </svg>
      </g>
      <g clipPath="url(#spin-face-aperture)" pointerEvents="none" aria-hidden="true">
        <path className="spin-socket" d="M640 605H930V675H640Z" fill="#062326" />
        <g className="spin-face" data-layer="spin-face">
          <svg x="635" y="605" width="298" height="87.638" viewBox="88 77 1962 577" overflow="hidden">
            <image href={artwork['spin-button-v3.png']} width="2140" height="735" />
          </svg>
          <path className="spin-face-shade" d="M640 605H930V675H640Z" fill="#041c20" />
          <g id="spin-caption" data-layer="spin-caption">
            <foreignObject x="659" y="611" width="252" height="56">
              <div className="spin-caption-content" data-busy={busy}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8a8 8 0 1 0 1 7M19 3v6h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>{t(busy ? 'spin.busy' : 'spin.action')}</span>
              </div>
            </foreignObject>
          </g>
        </g>
      </g>
      <foreignObject x="635" y="605" width="298" height="87.638" className="spin-control" data-layer="spin-control">
        <button id="spin-control" type="button" aria-label={t(busy ? 'spin.busy' : 'spin.action')} aria-controls="reading-prompt" aria-disabled={busy} aria-busy={busy} {...handlers} />
      </foreignObject>
    </g>
  )
}
