import { useLocale } from '../../i18n/LocaleContext'
import { artwork } from './artwork'
import { useSpinPress } from '../../motion/useSpinPress'

// The brass housing and native hit target stay fixed. Only the turquoise face moves.
export function SpinControl({ onSpin, busy = false }: { onSpin: () => void; busy?: boolean }) {
  const { locale, t } = useLocale()
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
            <g transform="translate(710 644) scale(.8) translate(-710 -664)">
              <path d="M725 652a17 17 0 1 0 2 17 M725 644v10h-11" fill="none" stroke="#ffe7ba" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x={busy ? 748 : 756} y={busy ? 651 : 655} style={{ fontSize: busy ? '23px' : locale === 'ru' ? '28px' : '40px', fontWeight: '700', fill: '#ffe7ba', letterSpacing: busy || locale === 'ru' ? '1px' : '3px' }}>{t(busy ? 'spin.busy' : 'spin.action')}</text>
          </g>
        </g>
      </g>
      <foreignObject x="635" y="605" width="298" height="87.638" className="spin-control" data-layer="spin-control">
        <button id="spin-control" type="button" aria-label={t(busy ? 'spin.busy' : 'spin.action')} aria-controls="reading-prompt" aria-disabled={busy} aria-busy={busy} {...handlers} />
      </foreignObject>
    </g>
  )
}
