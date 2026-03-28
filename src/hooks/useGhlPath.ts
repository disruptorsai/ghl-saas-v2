import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

export type GhlPath = 'own' | 'sub' | null

/**
 * Per-client GHL path selection.
 * Stores in localStorage keyed by clientId.
 */
export function useGhlPath() {
  const { clientId } = useParams()
  const storageKey = `ghl-path-${clientId || 'default'}`

  const [path, setPathState] = useState<GhlPath>(() => {
    return (localStorage.getItem(storageKey) as GhlPath) || null
  })

  const setPath = useCallback(
    (p: GhlPath) => {
      setPathState(p)
      if (p) {
        localStorage.setItem(storageKey, p)
      } else {
        localStorage.removeItem(storageKey)
      }
    },
    [storageKey],
  )

  return { path, setPath, isOwn: path === 'own', isSub: path === 'sub' }
}
