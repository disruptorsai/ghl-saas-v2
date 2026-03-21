import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useClassroomProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('classroom_progress')
      .select('step_id, completed')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        data?.forEach(p => { map[p.step_id] = p.completed })
        setProgress(map)
        setLoading(false)
      })
  }, [user])

  const toggleStep = async (stepId: string) => {
    if (!user) return
    const current = progress[stepId] || false
    const { error } = await supabase
      .from('classroom_progress')
      .upsert({
        user_id: user.id,
        step_id: stepId,
        completed: !current,
        completed_at: !current ? new Date().toISOString() : null,
      })
    if (error) throw error
    setProgress(prev => ({ ...prev, [stepId]: !current }))
  }

  const isStepCompleted = (stepId: string) => progress[stepId] || false

  const getModuleProgress = (moduleId: string, steps: { id: string }[]) => {
    const moduleSteps = steps.filter(s => true) // all steps for this module
    const completed = moduleSteps.filter(s => progress[s.id]).length
    return {
      completed,
      total: moduleSteps.length,
      percentage: moduleSteps.length > 0 ? Math.round((completed / moduleSteps.length) * 100) : 0,
    }
  }

  return { progress, loading, toggleStep, isStepCompleted, getModuleProgress }
}
