import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { UserProgress } from '@/data/types'
import { modules } from '@/data/modules'

const STORAGE_KEY_PREFIX = 'disruptors-infra-progress'

function loadProgress(storageKey: string): UserProgress {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveProgress(storageKey: string, progress: UserProgress) {
  localStorage.setItem(storageKey, JSON.stringify(progress))
}

export function useProgress() {
  const { clientId } = useParams<{ clientId: string }>()
  const storageKey = clientId ? `${STORAGE_KEY_PREFIX}-${clientId}` : STORAGE_KEY_PREFIX
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress(storageKey))

  const toggleStep = useCallback((stepId: string) => {
    setProgress((prev) => {
      const isCompleted = prev[stepId]?.completed
      const next = {
        ...prev,
        [stepId]: {
          completed: !isCompleted,
          completedAt: !isCompleted ? new Date().toISOString() : null,
        },
      }
      saveProgress(storageKey, next)
      return next
    })
  }, [storageKey])

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

  return {
    progress,
    toggleStep,
    isStepCompleted,
    getModuleProgress,
    getOverallProgress,
  }
}
