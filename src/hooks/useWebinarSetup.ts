import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export interface WebinarSetup {
  id: string
  webinar_url: string | null
  replay_url: string | null
  time_range: string | null
  metrics: Record<string, any> | null
  last_updated: string
}

export function useWebinarSetup() {
  const { clientDb, clientId } = useClientSupabase()
  const [setup, setSetup] = useState<WebinarSetup | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSetup = useCallback(async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)
    const { data } = await clientDb
      .from('webinar_setup')
      .select('*')
      .maybeSingle()
    if (data) setSetup(data)
    setLoading(false)
  }, [clientDb])

  useEffect(() => {
    fetchSetup()
  }, [fetchSetup])

  const upsertSetup = async (updates: Partial<WebinarSetup>) => {
    if (!clientDb || !clientId) throw new Error('Client not connected')
    if (setup?.id) {
      const { error } = await clientDb
        .from('webinar_setup')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', setup.id)
      if (error) throw error
    } else {
      const { error } = await clientDb
        .from('webinar_setup')
        .insert({ ...updates, last_updated: new Date().toISOString() })
      if (error) throw error
    }
    await fetchSetup()
  }

  return { setup, loading, upsertSetup, refetch: fetchSetup }
}
