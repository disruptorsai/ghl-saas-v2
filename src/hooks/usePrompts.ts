import { useState, useEffect, useRef } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { toast } from 'sonner'
import { seedDefaultPrompts } from '@/lib/prompt-seeds'

export interface Prompt {
  id: number
  prompt_type: 'text' | 'voice'
  category: 'persona' | 'main_agent' | 'booking'
  prompt_name: string
  description: string | null
  content: string | null
  is_active: boolean
}

/** Category labels and order for UI grouping */
export const CATEGORY_CONFIG = {
  persona: { label: 'Persona Prompt', icon: 'persona', order: 0 },
  main_agent: { label: 'Main Agent Prompts', icon: 'main_agent', order: 1 },
  booking: { label: 'Booking Prompts', icon: 'booking', order: 2 },
} as const

export type PromptCategory = keyof typeof CATEGORY_CONFIG

/**
 * Prompts use a composite key (id, prompt_type).
 * Text prompts = IDs 0-8, Voice prompts = IDs 0-5.
 * Each prompt belongs to a category: persona, main_agent, or booking.
 * Update only — no create or delete (rows are fixed).
 */
export function usePrompts(type: 'text' | 'voice') {
  const { clientDb, clientId } = useClientSupabase()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const seededRef = useRef(false)

  const fetchPrompts = async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await clientDb
      .from('prompts')
      .select('*')
      .eq('prompt_type', type)
      .order('id', { ascending: true })
    if (error) { toast.error('Failed to load prompts'); console.error(error) }
    else {
      setPrompts(data || [])

      // Auto-seed default content into empty prompt slots (runs once per type)
      if (!seededRef.current && data && data.length > 0) {
        const empty = data
          .filter((p: Prompt) => !p.content)
          .map((p: Prompt) => ({ id: p.id, prompt_type: p.prompt_type }))
        if (empty.length > 0) {
          seededRef.current = true
          seedDefaultPrompts(clientDb, empty).then((count) => {
            if (count > 0) fetchPrompts() // refetch to show seeded content
          }).catch(() => {}) // silent fail — user can still edit manually
        } else {
          seededRef.current = true
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => { seededRef.current = false }, [clientDb, type])
  useEffect(() => { fetchPrompts() }, [clientDb, type])

  const updatePrompt = async (
    id: number,
    data: { prompt_name?: string; content?: string; is_active?: boolean }
  ) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb
      .from('prompts')
      .update(data)
      .eq('id', id)
      .eq('prompt_type', type)
    if (error) throw error
    await fetchPrompts()
  }

  /** Group prompts by category in the correct order */
  const grouped = (['persona', 'main_agent', 'booking'] as PromptCategory[])
    .map((cat) => ({
      category: cat,
      ...CATEGORY_CONFIG[cat],
      prompts: prompts.filter((p) => p.category === cat),
    }))
    .filter((g) => g.prompts.length > 0)

  return { prompts, grouped, loading, updatePrompt, refetch: fetchPrompts }
}
