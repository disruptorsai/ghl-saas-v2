import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface StepContent {
  step_id: string
  instructions: string
  video_url: string | null
}

export function useModuleContent(moduleId: string | undefined) {
  const [content, setContent] = useState<Record<string, StepContent>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId) {
      setLoading(false)
      return
    }

    const fetchContent = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('module_content')
        .select('step_id, instructions, video_url')
        .eq('module_id', moduleId)

      if (data) {
        const mapped: Record<string, StepContent> = {}
        for (const row of data) {
          mapped[row.step_id] = row
        }
        setContent(mapped)
      }
      setLoading(false)
    }

    fetchContent()
  }, [moduleId])

  const getStepContent = (stepId: string) => content[stepId] ?? null

  return { content, loading, getStepContent }
}
