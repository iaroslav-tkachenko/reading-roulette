export const promptUpdateDuration = 1600

export function createPromptUpdateFeedback(notify: (visible: boolean) => void, clock = {
  schedule: (callback: () => void, delay: number) => setTimeout(callback, delay),
  clear: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
}) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let epoch = 0
  const clear = () => { epoch++; if (timer !== undefined) clock.clear(timer); timer = undefined }
  return {
    show() {
      clear()
      const current = epoch
      notify(true)
      timer = clock.schedule(() => { if (current === epoch) { timer = undefined; notify(false) } }, promptUpdateDuration)
    },
    cancel() { clear(); notify(false) },
    dispose: clear,
  }
}
