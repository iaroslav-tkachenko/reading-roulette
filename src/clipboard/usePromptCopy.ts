import { useLayoutEffect, useState } from 'react'
import { createPromptCopier } from './promptCopier'
import type { CopyStatus } from './promptCopier'

export function usePromptCopy(prompt: string, disabled = false, revision = 0) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const [copier] = useState(() => createPromptCopier(setStatus))

  useLayoutEffect(() => {
    if (disabled) { copier.cancel(); setStatus('idle') }
    else copier.reset(prompt)
    // Invalidates replies on prompt change, unmount and StrictMode cleanup.
    return () => copier.cancel()
  }, [copier, prompt, disabled, revision])

  return { status, copyPrompt: copier.copy }
}
