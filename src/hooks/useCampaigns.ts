import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { useAuth } from '@/contexts/AuthContext'
import { logAuditEvent } from '@/lib/audit-log'
import { createNotification } from '@/lib/notifications'

export interface Campaign {
  id: string
  campaign_name: string
  reactivation_notes: string | null
  webhook_url: string | null
  status: string
  total_leads: number
  processed_leads: number
  days_of_week: string[] | null
  start_time: string | null
  end_time: string | null
  timezone: string | null
  batch_size: number | null
  batch_interval_minutes: number | null
  lead_delay_seconds: number | null
  created_at: string
  updated_at: string
}

export function useCampaigns() {
  const { clientDb, clientId } = useClientSupabase()
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async (silent = false) => {
    if (!clientDb || !clientId) { setLoading(false); return }
    if (!silent) setLoading(true)
    const { data, error } = await clientDb
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setCampaigns(data)
    setLoading(false)
  }, [clientDb])

  useEffect(() => {
    fetchCampaigns()
    if (!clientDb) return
    const channel = clientDb
      .channel('campaigns-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => fetchCampaigns(true))
      .subscribe()
    return () => { clientDb.removeChannel(channel) }
  }, [fetchCampaigns, clientDb])

  const createCampaign = async (data: Partial<Campaign> & { campaign_name: string }) => {
    if (!clientDb || !clientId) throw new Error('Client not connected')
    const { data: newCampaign, error } = await clientDb
      .from('campaigns')
      .insert({ ...data, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    if (clientId) {
      logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'created', entityType: 'campaign', entityId: newCampaign?.id, entityName: data.campaign_name })
      createNotification({ clientId, userId: user?.id, title: 'Campaign Created', message: `${data.campaign_name} has been created`, type: 'info', entityType: 'campaign', entityId: newCampaign?.id, link: `/c/${clientId}/management/campaigns/${newCampaign?.id}` })
    }
    return newCampaign
  }

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.from('campaigns').update(data).eq('id', id)
    if (error) throw error
    if (clientId) logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'updated', entityType: 'campaign', entityId: id, details: data as Record<string, unknown> })
  }

  const deleteCampaign = async (id: string) => {
    if (!clientDb) throw new Error('Client not connected')
    const { error } = await clientDb.rpc('delete_campaign_with_data', { campaign_id_param: id })
    if (error) throw error
    if (clientId) {
      logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'deleted', entityType: 'campaign', entityId: id })
      createNotification({ clientId, userId: user?.id, title: 'Campaign Deleted', message: `A campaign has been deleted`, type: 'info', entityType: 'campaign', entityId: id })
    }
  }

  return { campaigns, loading, createCampaign, updateCampaign, deleteCampaign, refetch: fetchCampaigns }
}
