export const copyMessages = {
  idle: 'Paste into your preferred AI chat.',
  copying: 'Copying prompt…',
  success: '✓ Prompt copied. Paste it into your AI chat.',
  error: 'Could not copy automatically. Select the prompt and copy it manually.',
} as const

export type CopyStatus = keyof typeof copyMessages

function copyWithDocumentCommand(prompt: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false
  const textarea = document.createElement('textarea')
  textarea.value = prompt
  textarea.setAttribute('readonly', '')
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0'
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.body.appendChild(textarea)
  try {
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, prompt.length)
    return document.execCommand('copy')
  } finally {
    textarea.remove()
    previousFocus?.focus({ preventScroll: true })
  }
}

export async function writePromptToClipboard(prompt: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(prompt)
      return
    } catch (error) {
      if (copyWithDocumentCommand(prompt)) return
      throw error
    }
  }
  if (copyWithDocumentCommand(prompt)) return
  throw new Error('Clipboard unavailable')
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
