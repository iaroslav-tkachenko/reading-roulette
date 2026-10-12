export interface PressClock {
  now: () => number
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  clear: (timer: ReturnType<typeof setTimeout>) => void
}

const clock: PressClock = {
  now: () => performance.now(),
  schedule: (callback, delay) => setTimeout(callback, delay),
  clear: timer => clearTimeout(timer),
}

// Native click decides activation; this controller only manages the visual travel.
export function createSpinPress(notify: (pressed: boolean) => void, time = clock) {
  let active = true
  let held: string | null = null
  let pressedAt = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function clear() {
    if (timer !== undefined) time.clear(timer)
    timer = undefined
  }

  function show() {
    clear()
    pressedAt = time.now()
    notify(true)
  }

  function release() {
    clear()
    // Even a very short tap has time to complete the 60 ms downward stroke.
    const remaining = Math.max(0, 60 - (time.now() - pressedAt))
    if (!remaining) notify(false)
    else timer = time.schedule(() => {
      timer = undefined
      if (active && !held) notify(false)
    }, remaining)
  }

  return {
    resume() { active = true; held = null; clear(); notify(false) },
    press(source: string) {
      if (!active || held) return
      held = source
      show()
    },
    release(source: string) {
      if (!active || held !== source) return
      held = null
      release()
    },
    pulse() {
      if (!active || held) return
      show()
      release()
    },
    cancel() { held = null; clear(); if (active) notify(false) },
    dispose() { active = false; held = null; clear() },
  }
}

export type SpinPress = ReturnType<typeof createSpinPress>

// Kept separate so cancellation and native activation can be checked without a browser.
export function createSpinPressHandlers(press: SpinPress, onSpin: () => void) {
  return {
    onPointerDown(event: { button: number; isPrimary: boolean; pointerId: number }) {
      if (event.button === 0 && event.isPrimary) press.press(`pointer:${event.pointerId}`)
    },
    onPointerUp(event: { pointerId: number }) { press.release(`pointer:${event.pointerId}`) },
    onPointerLeave(event: { pointerId: number }) { press.release(`pointer:${event.pointerId}`) },
    onPointerCancel(event: { pointerId: number }) { press.release(`pointer:${event.pointerId}`) },
    onKeyDown(event: { key: string; repeat: boolean; preventDefault: () => void }) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      if (event.repeat) { event.preventDefault(); return }
      press.press(`key:${event.key}`)
    },
    onKeyUp(event: { key: string }) { press.release(`key:${event.key}`) },
    onBlur() { press.cancel() },
    onContextMenu() { press.cancel() },
    onClick() { press.pulse(); onSpin() },
  }
}
