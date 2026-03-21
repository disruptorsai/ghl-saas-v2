import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useClientConfig(clientId: string) {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
    if (!error && data) setConfig(data as Record<string, unknown>)
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = async (updates: Record<string, unknown>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', clientId)
    if (error) throw error
    setConfig(prev => prev ? { ...prev, ...updates } : prev)
  }

  return { config, loading, updateConfig, refetch: fetchConfig }
}
