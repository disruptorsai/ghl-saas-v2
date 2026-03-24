import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import type { UserProgress } from '@/data/types'
import { modules } from '@/data/modules'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY_PREFIX = 'disruptors-infra-progress'

/** Load from localStorage as fast cache */
function loadLocalProgress(clientId: string): UserProgress {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${clientId}`)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/** Save to localStorage for instant reads */
function saveLocalProgress(clientId: string, progress: UserProgress) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}-${clientId}`, JSON.stringify(progress))
}

interface ProgressContextType {
  progress: UserProgress
  toggleStep: (stepId: string) => void
  isStepCompleted: (stepId: string) => boolean
  getModuleProgress: (moduleId: string) => { completed: number; total: number; percentage: number }
  getOverallProgress: () => { completed: number; total: number; percentage: number }
  loading: boolean
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>()
  const [progress, setProgress] = useState<UserProgress>(() =>
    clientId ? loadLocalProgress(clientId) : {}
  )
  const [loading, setLoading] = useState(true)
  const syncingRef = useRef(false)

  // Fetch progress from Supabase on mount
  useEffect(() => {
    if (!clientId) { setLoading(false); return }

    let cancelled = false

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('client_step_progress')
        .select('step_id, completed, completed_at')
        .eq('client_id', clientId)

      if (cancelled) return

      if (error) {
        // Table might not exist yet — fall back to localStorage
        console.warn('Failed to fetch progress from Supabase, using localStorage:', error.message)
        setLoading(false)
        return
      }

      if (data) {
        const remote: UserProgress = {}
        data.forEach((row) => {
          if (row.completed) {
            remote[row.step_id] = {
              completed: true,
              completedAt: row.completed_at,
            }
          }
        })
        setProgress(remote)
        saveLocalProgress(clientId!, remote)
      }
      setLoading(false)
    }

    fetchProgress()
    return () => { cancelled = true }
  }, [clientId])

  const toggleStep = useCallback((stepId: string) => {
    if (!clientId || syncingRef.current) return

    setProgress((prev) => {
      const isCompleted = prev[stepId]?.completed
      const completedAt = !isCompleted ? new Date().toISOString() : null
      const next = {
        ...prev,
        [stepId]: {
          completed: !isCompleted,
          completedAt,
        },
      }

      // Save to localStorage immediately for instant UI
      saveLocalProgress(clientId, next)

      // Sync to Supabase in background
      syncingRef.current = true
      if (!isCompleted) {
        // Upsert completed
        supabase
          .from('client_step_progress')
          .upsert({
            client_id: clientId,
            step_id: stepId,
            completed: true,
            completed_at: completedAt,
          }, { onConflict: 'client_id,step_id' })
          .then(({ error }) => {
            if (error) console.warn('Failed to save progress:', error.message)
            syncingRef.current = false
          })
      } else {
        // Delete the row (uncomplete)
        supabase
          .from('client_step_progress')
          .delete()
          .eq('client_id', clientId)
          .eq('step_id', stepId)
          .then(({ error }) => {
            if (error) console.warn('Failed to remove progress:', error.message)
            syncingRef.current = false
          })
      }

      return next
    })
  }, [clientId])

  const isStepCompleted = useCallback(
    (stepId: string) => {
      return progress[stepId]?.completed ?? false
    },
    [progress]
  )

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = modules.find((m) => m.id === moduleId)
      if (!mod) return { completed: 0, total: 0, percentage: 0 }
      const total = mod.steps.length
      const completed = mod.steps.filter(
        (s) => progress[s.id]?.completed
      ).length
      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    },
    [progress]
  )

  const getOverallProgress = useCallback(() => {
    const allSteps = modules.flatMap((m) => m.steps)
    const total = allSteps.length
    const completed = allSteps.filter(
      (s) => progress[s.id]?.completed
    ).length
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [progress])

  const value = useMemo(() => ({
    progress,
    toggleStep,
    isStepCompleted,
    getModuleProgress,
    getOverallProgress,
    loading,
  }), [progress, toggleStep, isStepCompleted, getModuleProgress, getOverallProgress, loading])

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
