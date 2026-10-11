import { useEffect, useState } from 'react'
import { createSpinPress, createSpinPressHandlers } from './spinPress'

export function useSpinPress(onSpin: () => void, busy = false) {
  const [pressed, setPressed] = useState(false)
  const [press] = useState(() => createSpinPress(setPressed))

  useEffect(() => {
    press.resume()
    const releasePointer = (event: PointerEvent) => press.release(`pointer:${event.pointerId}`)
    const releaseKey = (event: KeyboardEvent) => press.release(`key:${event.key}`)
    const cancel = () => press.cancel()
    const hide = () => { if (document.hidden) press.cancel() }
    window.addEventListener('pointerup', releasePointer)
    window.addEventListener('pointercancel', releasePointer)
    window.addEventListener('keyup', releaseKey)
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', hide)
    return () => {
      press.dispose()
      window.removeEventListener('pointerup', releasePointer)
      window.removeEventListener('pointercancel', releasePointer)
      window.removeEventListener('keyup', releaseKey)
      window.removeEventListener('blur', cancel)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [press])

  return { pressed, handlers: createSpinPressHandlers(press, onSpin, busy) }
}
