import { useSyncExternalStore } from 'react'

const query = '(max-width: 900px)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query)
  let frame = 0
  const change = () => {
    const id = document.activeElement?.id
    notify()
    if (id && ['reading-language', 'reading-cefr', 'reading-length', 'spin-control'].includes(id)) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Keep keyboard position when the same control moves to the other layout.
        if (document.activeElement === document.body || document.activeElement?.id === id) {
          document.getElementById(id)?.focus({ preventScroll: true })
        }
      })
    }
  }
  media.addEventListener('change', change)
  return () => { media.removeEventListener('change', change); cancelAnimationFrame(frame) }
}

export function useCompactScene() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
