export const copyMessages = {
  idle: 'Paste into your preferred AI chat.',
  copying: 'Copying prompt…',
  success: '✓ Prompt copied. Paste it into your AI chat.',
  error: 'Could not copy automatically. Select the prompt and copy it manually.',
} as const

export type CopyStatus = keyof typeof copyMessages

export function writePromptToClipboard(prompt: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard unavailable')
  }
  return navigator.clipboard.writeText(prompt)
}

// Epochs guard async replies even if the prompt changes A → B → A.
// The writer is injectable for tests; the application uses the browser Clipboard API.
export function createPromptCopier(
  notify: (status: CopyStatus) => void,
  write: (prompt: string) => Promise<void> = writePromptToClipboard,
) {
  let epoch = 0
  let active = false
  let pending = false
  let prompt = ''

  return {
    reset(nextPrompt: string) {
      epoch++
      active = true
      pending = false
      prompt = nextPrompt
      notify('idle')
    },
    cancel() {
      epoch++
      active = false
      pending = false
    },
    async copy() {
      if (!active || pending) return
      const request = ++epoch
      const copiedPrompt = prompt
      const valid = () => active && request === epoch
      pending = true
      notify('copying')
      try {
        // Invoke during the user's click/keyboard event, before yielding.
        await write(copiedPrompt)
        if (valid()) notify('success')
      } catch {
        if (valid()) notify('error')
      } finally {
        if (valid()) pending = false
      }
    },
  }
}
