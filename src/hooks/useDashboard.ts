import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalLeads: number
  processedLeads: number
  successRate: number
}

interface ClientInfo {
  name: string
  email: string | null
  logo_url: string | null
  image_url: string | null
}

export function useDashboard() {
  const { clientDb, clientId, connection } = useClientSupabase()
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalLeads: 0,
    processedLeads: 0,
    successRate: 0,
  })
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!clientDb || !clientId) { setLoading(false); return }
    if (!silent) setLoading(true)
    setError(null)

    if (connection) {
      setClient({
        name: connection.name,
        email: connection.email,
        logo_url: connection.logo_url,
        image_url: connection.image_url,
      })
    }

    const { data: campaigns, error: queryError } = await clientDb
      .from('campaigns')
      .select('status, total_leads, processed_leads')

    if (queryError) {
      console.error('[Dashboard] Failed to fetch campaigns from client Supabase:', queryError)
      setError(
        queryError.message.includes('does not exist') || queryError.message.includes('schema cache')
          ? 'The "campaigns" table does not exist in the client Supabase. Please run the migration SQL from CLIENTSQL.md in the client\'s SQL Editor.'
          : `Failed to load campaign data: ${queryError.message}`
      )
      setLoading(false)
      return
    }

    if (campaigns) {
      const totalCampaigns = campaigns.length
      const activeCampaigns = campaigns.filter((c) =>
        ['active', 'processing', 'batch_processing'].includes(c.status)
      ).length
      const completedCampaigns = campaigns.filter(
        (c) => c.status === 'completed'
      ).length
      const totalLeads = campaigns.reduce(
        (sum, c) => sum + (c.total_leads || 0),
        0
      )
      const processedLeads = campaigns.reduce(
        (sum, c) => sum + (c.processed_leads || 0),
        0
      )
      const successRate =
        totalLeads > 0
          ? Math.round((processedLeads / totalLeads) * 100)
          : 0

      setStats({
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalLeads,
        processedLeads,
        successRate,
      })
    }

    setLoading(false)
  }, [clientDb, clientId, connection])

  useEffect(() => {
    fetchDashboard()
    if (!clientDb) return
    const channel = clientDb
      .channel('dashboard-campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => fetchDashboard(true))
      .subscribe()
    return () => { clientDb.removeChannel(channel) }
  }, [clientDb, fetchDashboard])

  return { stats, client, loading, error, refetch: fetchDashboard }
}
