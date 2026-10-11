import { useLayoutEffect, useState } from 'react'
import { createPromptCopier } from './promptCopier'
import type { CopyStatus } from './promptCopier'

export function usePromptCopy(prompt: string) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const [copier] = useState(() => createPromptCopier(setStatus))

  useLayoutEffect(() => {
    copier.reset(prompt)
    // Invalidates replies on prompt change, unmount and StrictMode cleanup.
    return () => copier.cancel()
  }, [copier, prompt])

  return { status, copyPrompt: copier.copy }
}
