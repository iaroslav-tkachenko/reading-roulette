import asset0 from '../../assets/reading-machine/optimized/study-shell-v7.webp'
import asset1 from '../../assets/reading-machine/optimized/paper-v1.webp'
import asset2 from '../../assets/reading-machine/optimized/chassis-v3.webp'
import asset3 from '../../assets/reading-machine/optimized/settings-v2.webp'
import asset4 from '../../assets/reading-machine/optimized/drum-v1.webp'
import asset5 from '../../assets/reading-machine/optimized/wheel-v1.webp'
import asset6 from '../../assets/reading-machine/optimized/mechanism-v2.webp'
import asset7 from '../../assets/reading-machine/optimized/key-v1.webp'
import asset8 from '../../assets/reading-machine/optimized/spin-button-v3.webp'
import asset9 from '../../assets/reading-machine/optimized/desk-lamp-books-v7.webp'
import asset10 from '../../assets/reading-machine/optimized/desk-books-v7.webp'
import asset11 from '../../assets/reading-machine/optimized/desk-pen-cup-v7.webp'
import asset12 from '../../assets/reading-machine/optimized/study-window-wide-v8.webp'
import asset13 from '../../assets/reading-machine/optimized/study-bookcase-wide-v8.webp'
import compactDeskBooks from '../../assets/reading-machine/optimized/compact/desk-books-v7.webp'
import compactDeskLampBooks from '../../assets/reading-machine/optimized/compact/desk-lamp-books-v7.webp'
import compactDeskPenCup from '../../assets/reading-machine/optimized/compact/desk-pen-cup-v7.webp'
import compactBookcase from '../../assets/reading-machine/optimized/compact/study-bookcase-wide-v8.webp'
import compactWindow from '../../assets/reading-machine/optimized/compact/study-window-wide-v8.webp'

// Keep the original logical keys used by the SVG scene components. The files
// behind these URLs are generated WebP derivatives; the source PNGs stay intact.
export const artwork = {
  'study-shell-v7.png': asset0,
  'paper-v1.png': asset1,
  'chassis-v3.png': asset2,
  'settings-v2.png': asset3,
  'drum-v1.png': asset4,
  'wheel-v1.png': asset5,
  'mechanism-v2.png': asset6,
  'key-v1.png': asset7,
  'spin-button-v3.png': asset8,
  'desk-lamp-books-v7.png': asset9,
  'desk-books-v7.png': asset10,
  'desk-pen-cup-v7.png': asset11,
  'study-window-wide-v8.png': asset12,
  'study-bookcase-wide-v8.png': asset13,
} as const

// These room props scale with the artboard, so compact layouts can use files
// sized for the 900 CSS px compact-layout ceiling at 2x pixel density.
export const compactRoomArtwork: Partial<Record<keyof typeof artwork, string>> = {
  'desk-books-v7.png': compactDeskBooks,
  'desk-lamp-books-v7.png': compactDeskLampBooks,
  'desk-pen-cup-v7.png': compactDeskPenCup,
  'study-bookcase-wide-v8.png': compactBookcase,
  'study-window-wide-v8.png': compactWindow,
}
