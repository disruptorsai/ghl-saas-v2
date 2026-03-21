import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export interface AnalyticsData {
  id: string
  analytics_type: string
  time_range: string
  metrics: Record<string, unknown>
  last_updated: string
}

export interface CustomMetric {
  id: string
  analytics_type: string
  name: string
  description: string | null
  prompt: string | null
  color: string | null
}

export function useAnalytics(type: 'chat' | 'voice') {
  const { clientDb, clientId } = useClientSupabase()
  const [data, setData] = useState<AnalyticsData[]>([])
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([])
  const [loading, setLoading] = useState(true)

  const table = type === 'chat' ? 'chat_analytics' : 'voice_chat_analytics'

  const fetchAnalytics = useCallback(async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)
    const [analyticsRes, metricsRes] = await Promise.all([
      clientDb
        .from(table)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false }),
      clientDb
        .from('custom_metrics')
        .select('*')
        .eq('client_id', clientId)
        .eq('analytics_type', type),
    ])
    if (analyticsRes.data) setData(analyticsRes.data)
    if (metricsRes.data) setCustomMetrics(metricsRes.data)
    setLoading(false)
  }, [clientDb, type, table])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const createCustomMetric = async (
    metric: Partial<CustomMetric> & { name: string }
  ) => {
    if (!clientDb || !clientId) throw new Error('Client not connected')
    const { error } = await clientDb.from('custom_metrics').insert({
      ...metric,
      analytics_type: type,
    })
    if (error) throw error
    await fetchAnalytics()
  }

  const deleteCustomMetric = async (id: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb
      .from('custom_metrics')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchAnalytics()
  }

  return {
    data,
    customMetrics,
    loading,
    createCustomMetric,
    deleteCustomMetric,
    refetch: fetchAnalytics,
  }
}
