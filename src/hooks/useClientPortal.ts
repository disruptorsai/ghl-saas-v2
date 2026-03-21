import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

// ─── Types ──────────────────────────────────────────────
export interface PortalTask {
  id: string
  step_id: string
  name: string
  created_at: string
  completed: boolean
}

export interface PortalStep {
  id: string
  phase_id: string
  name: string
  content: { blocks: unknown[] }
  created_at: string
  completed: boolean
  tasks: PortalTask[]
}

export interface PortalPhase {
  id: string
  portal_id: string
  name: string
  order_index: number
  created_at: string
  steps: PortalStep[]
}

export interface ClientPortalData {
  id: string
  name: string
  created_at: string
  updated_at: string
  phases: PortalPhase[]
}

// ─── Hook ───────────────────────────────────────────────
export function useClientPortal() {
  const { clientDb, clientId } = useClientSupabase()
  const [portal, setPortal] = useState<ClientPortalData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPortal = useCallback(async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)

    let { data: portalRow, error: portalErr } = await clientDb
      .from('client_portals')
      .select('*')
      .maybeSingle()

    if (portalErr) {
      console.error('Error fetching portal:', portalErr)
      setLoading(false)
      return
    }

    if (!portalRow) {
      const { data: created, error: createErr } = await clientDb
        .from('client_portals')
        .insert({})
        .select()
        .single()
      if (createErr) {
        console.error('Error creating portal:', createErr)
        setLoading(false)
        return
      }
      portalRow = created
    }

    const portalId = portalRow.id as string

    const { data: phases } = await clientDb
      .from('portal_phases')
      .select('*')
      .eq('portal_id', portalId)
      .order('order_index', { ascending: true })

    const phaseIds = (phases ?? []).map((p: { id: string }) => p.id)
    let steps: Record<string, unknown>[] = []
    if (phaseIds.length > 0) {
      const { data: s } = await clientDb
        .from('portal_steps')
        .select('*')
        .in('phase_id', phaseIds)
      steps = s ?? []
    }

    const stepIds = steps.map((s: Record<string, unknown>) => s.id as string)
    let tasks: Record<string, unknown>[] = []
    if (stepIds.length > 0) {
      const { data: t } = await clientDb
        .from('portal_tasks')
        .select('*')
        .in('step_id', stepIds)
      tasks = t ?? []
    }

    let stepCompletions: Record<string, unknown>[] = []
    let taskCompletions: Record<string, unknown>[] = []
    if (stepIds.length > 0) {
      const { data: sc } = await clientDb
        .from('portal_step_completions')
        .select('*')
        .eq('portal_id', portalId)
        .in('step_id', stepIds)
      stepCompletions = sc ?? []
    }
    const taskIds = tasks.map((t: Record<string, unknown>) => t.id as string)
    if (taskIds.length > 0) {
      const { data: tc } = await clientDb
        .from('portal_task_completions')
        .select('*')
        .eq('portal_id', portalId)
        .in('task_id', taskIds)
      taskCompletions = tc ?? []
    }

    const stepCompletionMap = new Map(
      stepCompletions.map((c) => [c.step_id as string, c.completed as boolean])
    )
    const taskCompletionMap = new Map(
      taskCompletions.map((c) => [c.task_id as string, c.completed as boolean])
    )

    const assembledPhases: PortalPhase[] = (phases ?? []).map(
      (phase: Record<string, unknown>) => {
        const phaseSteps = steps
          .filter((s) => s.phase_id === phase.id)
          .map((step) => {
            const stepTasks: PortalTask[] = tasks
              .filter((t) => t.step_id === step.id)
              .map((t) => ({
                id: t.id as string,
                step_id: t.step_id as string,
                name: t.name as string,
                created_at: t.created_at as string,
                completed: taskCompletionMap.get(t.id as string) ?? false,
              }))

            return {
              id: step.id as string,
              phase_id: step.phase_id as string,
              name: step.name as string,
              content: (step.content as { blocks: unknown[] }) ?? { blocks: [] },
              created_at: step.created_at as string,
              completed: stepCompletionMap.get(step.id as string) ?? false,
              tasks: stepTasks,
            } satisfies PortalStep
          })

        return {
          id: phase.id as string,
          portal_id: phase.portal_id as string,
          name: phase.name as string,
          order_index: phase.order_index as number,
          created_at: phase.created_at as string,
          steps: phaseSteps,
        } satisfies PortalPhase
      }
    )

    setPortal({
      id: portalRow.id as string,
      name: portalRow.name as string,
      created_at: portalRow.created_at as string,
      updated_at: portalRow.updated_at as string,
      phases: assembledPhases,
    })
    setLoading(false)
  }, [clientDb])

  useEffect(() => {
    fetchPortal()
  }, [fetchPortal])

  const addPhase = async () => {
    if (!portal || !clientDb) return
    const nextIndex =
      portal.phases.length > 0
        ? Math.max(...portal.phases.map((p) => p.order_index)) + 1
        : 0
    const { error } = await clientDb
      .from('portal_phases')
      .insert({ portal_id: portal.id, order_index: nextIndex })
    if (error) throw error
    await fetchPortal()
  }

  const updatePhase = async (phaseId: string, data: { name?: string; order_index?: number }) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_phases').update(data).eq('id', phaseId)
    if (error) throw error
    await fetchPortal()
  }

  const deletePhase = async (phaseId: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_phases').delete().eq('id', phaseId)
    if (error) throw error
    await fetchPortal()
  }

  const reorderPhases = async (orderedIds: string[]) => {
    if (!clientDb) return
    const updates = orderedIds.map((id, index) =>
      clientDb.from('portal_phases').update({ order_index: index }).eq('id', id)
    )
    await Promise.all(updates)
    await fetchPortal()
  }

  const addStep = async (phaseId: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_steps').insert({ phase_id: phaseId })
    if (error) throw error
    await fetchPortal()
  }

  const updateStep = async (stepId: string, data: { name?: string; content?: { blocks: unknown[] } }) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_steps').update(data).eq('id', stepId)
    if (error) throw error
    await fetchPortal()
  }

  const deleteStep = async (stepId: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_steps').delete().eq('id', stepId)
    if (error) throw error
    await fetchPortal()
  }

  const toggleStepCompletion = async (stepId: string, completed: boolean) => {
    if (!portal || !clientDb) return
    const { error } = await clientDb
      .from('portal_step_completions')
      .upsert(
        {
          step_id: stepId,
          portal_id: portal.id,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: 'step_id,portal_id' }
      )
    if (error) throw error
    await fetchPortal()
  }

  const addTask = async (stepId: string, name: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_tasks').insert({ step_id: stepId, name })
    if (error) throw error
    await fetchPortal()
  }

  const updateTask = async (taskId: string, data: { name?: string }) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_tasks').update(data).eq('id', taskId)
    if (error) throw error
    await fetchPortal()
  }

  const deleteTask = async (taskId: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('portal_tasks').delete().eq('id', taskId)
    if (error) throw error
    await fetchPortal()
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!portal || !clientDb) return
    const { error } = await clientDb
      .from('portal_task_completions')
      .upsert(
        {
          task_id: taskId,
          portal_id: portal.id,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: 'task_id,portal_id' }
      )
    if (error) throw error
    await fetchPortal()
  }

  const totalSteps = portal?.phases.reduce((sum, p) => sum + p.steps.length, 0) ?? 0
  const completedSteps =
    portal?.phases.reduce(
      (sum, p) => sum + p.steps.filter((s) => s.completed).length,
      0
    ) ?? 0
  const overallPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return {
    portal,
    loading,
    refetch: fetchPortal,
    addPhase, updatePhase, deletePhase, reorderPhases,
    addStep, updateStep, deleteStep, toggleStepCompletion,
    addTask, updateTask, deleteTask, toggleTaskCompletion,
    totalSteps, completedSteps, overallPercent,
  }
}
