import { useState, useCallback } from 'react'
import type { UserProgress } from '@/data/types'
import { modules } from '@/data/modules'

const STORAGE_KEY = 'disruptors-infra-progress'

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress)

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
      saveProgress(next)
      return next
    })
  }, [])

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
