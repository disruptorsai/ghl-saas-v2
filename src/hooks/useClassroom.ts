import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ClassroomModule {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  order: number
  created_at: string
  steps: ClassroomStep[]
}

export interface ClassroomStep {
  id: string
  module_id: string
  title: string
  description: string | null
  media_url: string | null
  media_type: 'video' | 'image' | 'flowchart' | 'embed' | null
  instructions: string | null
  type: 'info' | 'setup' | 'config' | 'demo' | null
  order: number
}

export function useClassroom() {
  const [modules, setModules] = useState<ClassroomModule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchModules = async () => {
    const { data } = await supabase
      .from('classroom_modules')
      .select('*, steps:classroom_steps(*)')
      .order('order')
    if (data) {
      setModules(data.map(m => ({
        ...m,
        steps: (m.steps || []).sort((a: ClassroomStep, b: ClassroomStep) => a.order - b.order)
      })))
    }
    setLoading(false)
  }

  useEffect(() => { fetchModules() }, [])

  const createModule = async (module: Partial<ClassroomModule>) => {
    const { error } = await supabase.from('classroom_modules').insert(module)
    if (error) throw error
    await fetchModules()
  }

  const updateModule = async (id: string, updates: Partial<ClassroomModule>) => {
    const { error } = await supabase.from('classroom_modules').update(updates).eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  const deleteModule = async (id: string) => {
    const { error } = await supabase.from('classroom_modules').delete().eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  const createStep = async (step: Partial<ClassroomStep>) => {
    const { error } = await supabase.from('classroom_steps').insert(step)
    if (error) throw error
    await fetchModules()
  }

  const updateStep = async (id: string, updates: Partial<ClassroomStep>) => {
    const { error } = await supabase.from('classroom_steps').update(updates).eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  const deleteStep = async (id: string) => {
    const { error } = await supabase.from('classroom_steps').delete().eq('id', id)
    if (error) throw error
    await fetchModules()
  }

  return { modules, loading, createModule, updateModule, deleteModule, createStep, updateStep, deleteStep, refetch: fetchModules }
}
