import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { useAuth } from '@/contexts/AuthContext'
import { logAuditEvent } from '@/lib/audit-log'
import { createNotification } from '@/lib/notifications'
import type { Campaign } from '@/hooks/useCampaigns'
import type { Lead } from '@/hooks/useLeads'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface ExecutorState {
  activeCampaignId: string | null
  launching: boolean
}

interface CampaignExecutorContextValue extends ExecutorState {
  launch: (campaign: Campaign, pendingLeads: Lead[]) => Promise<void>
  pause: (campaign: Campaign) => Promise<void>
  retryFailed: (campaign: Campaign) => Promise<void>
  resetStuckLeads: (campaign: Campaign) => Promise<void>
  /** Silently kick the edge function for the next batch (used by auto-polling). */
  tick: (campaign: Campaign) => Promise<void>
}

const CampaignExecutorContext = createContext<CampaignExecutorContextValue | null>(null)

export function CampaignExecutorProvider({ children }: { children: ReactNode }) {
  const { clientDb, clientId, connection } = useClientSupabase()
  const { user } = useAuth()
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const tickInFlight = useRef(false)

  /** Call the campaign-tick edge function to kick off processing. */
  const kickEdgeFunction = async (campaignId: string, webhookUrl: string) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/campaign-tick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        clientId,
        campaignId,
        campaign_webhook_url: webhookUrl,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.error || `Edge function returned ${res.status}`)
    }
  }

  const getWebhookUrl = (campaign: Campaign): string | null =>
    campaign.webhook_url || connection?.campaign_webhook_url || null

  /**
   * Launch campaign — processes pending leads via edge function.
   * Also resets any stuck "processing" leads back to pending before launching.
   */
  const launch = useCallback(
    async (campaign: Campaign, pendingLeads: Lead[]) => {
      if (!clientDb || !clientId) {
        toast.error('No database connection — please wait and try again')
        return
      }
      if (pendingLeads.length === 0) {
        toast.info('No pending leads to process')
        return
      }
      const webhookUrl = getWebhookUrl(campaign)
      if (!webhookUrl) {
        toast.error('No Campaign Webhook (per-lead) URL configured. Go to Credentials → Webhooks.')
        return
      }

      setLaunching(true)
      try {
        // Reset any stuck "processing" leads back to pending before launching
        await clientDb
          .from('leads')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('campaign_id', campaign.id)
          .eq('status', 'processing')

        toast.info(`Launching campaign with ${pendingLeads.length} leads…`)
        await kickEdgeFunction(campaign.id, webhookUrl)
        setActiveCampaignId(campaign.id)
        toast.success('Campaign launched — processing leads in the background')
        logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'launched', entityType: 'campaign', entityId: campaign.id, entityName: campaign.campaign_name, details: { leadCount: pendingLeads.length } })
        createNotification({ clientId, userId: user?.id, title: 'Campaign Launched', message: `${campaign.campaign_name} started with ${pendingLeads.length} leads`, type: 'success', entityType: 'campaign', entityId: campaign.id, link: `/c/${clientId}/management/campaigns/${campaign.id}` })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to launch campaign'
        toast.error(`Launch failed: ${msg}`)
      } finally {
        setLaunching(false)
      }
    },
    [clientDb, clientId, connection]
  )

  /** Pause campaign — sets status to paused so processing stops. */
  const pause = useCallback(
    async (campaign: Campaign) => {
      if (!clientDb) return
      await clientDb.from('campaigns').update({ status: 'paused' }).eq('id', campaign.id)
      setActiveCampaignId(null)
      toast.info('Campaign paused')
      if (clientId) {
        logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'paused', entityType: 'campaign', entityId: campaign.id, entityName: campaign.campaign_name })
        createNotification({ clientId, userId: user?.id, title: 'Campaign Paused', message: `${campaign.campaign_name} has been paused`, type: 'warning', entityType: 'campaign', entityId: campaign.id, link: `/c/${clientId}/management/campaigns/${campaign.id}` })
      }
    },
    [clientDb]
  )

  /** Retry failed leads — resets them to pending and re-kicks the edge function. */
  const retryFailed = useCallback(
    async (campaign: Campaign) => {
      if (!clientDb || !clientId) return
      const webhookUrl = getWebhookUrl(campaign)
      if (!webhookUrl) {
        toast.error('No Campaign Webhook (per-lead) URL configured. Go to Credentials → Webhooks.')
        return
      }

      setLaunching(true)
      try {
        // Count failed leads first
        const { count } = await clientDb
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'failed')

        if (!count || count === 0) {
          toast.info('No failed leads to retry')
          setLaunching(false)
          return
        }

        // Reset failed leads to pending
        await clientDb
          .from('leads')
          .update({
            status: 'pending',
            error_message: null,
            processed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('campaign_id', campaign.id)
          .eq('status', 'failed')

        toast.info(`Retrying ${count} failed leads…`)

        // Set campaign back to active
        await clientDb
          .from('campaigns')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', campaign.id)

        await kickEdgeFunction(campaign.id, webhookUrl)
        setActiveCampaignId(campaign.id)
        toast.success(`${count} failed leads queued for retry`)
        createNotification({ clientId, userId: user?.id, title: 'Campaign Retry', message: `${count} failed leads in ${campaign.campaign_name} queued for retry`, type: 'info', entityType: 'campaign', entityId: campaign.id, link: `/c/${clientId}/management/campaigns/${campaign.id}` })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to retry'
        toast.error(`Retry failed: ${msg}`)
      } finally {
        setLaunching(false)
      }
    },
    [clientDb, clientId, connection]
  )

  /**
   * Reset stuck leads — if the edge function crashed, some leads may be stuck
   * in "processing" forever. This resets them to pending.
   */
  const resetStuckLeads = useCallback(
    async (campaign: Campaign) => {
      if (!clientDb) return
      const { count } = await clientDb
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaign.id)
        .eq('status', 'processing')

      // Reset stuck leads to pending
      await clientDb
        .from('leads')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('campaign_id', campaign.id)
        .eq('status', 'processing')

      if (count && count > 0) {
        toast.success(`Reset ${count} stuck leads back to pending`)
      } else {
        toast.info('No stuck leads found')
      }
    },
    [clientDb]
  )

  /**
   * Tick — silently kick the edge function to process the next batch.
   * Used by auto-polling in CampaignDetail. No toasts, no state changes.
   * Deduplicates concurrent calls.
   */
  const tick = useCallback(
    async (campaign: Campaign) => {
      if (!clientId || tickInFlight.current) return
      const webhookUrl = getWebhookUrl(campaign)
      if (!webhookUrl) return
      if (campaign.status !== 'active' && campaign.status !== 'processing') return

      tickInFlight.current = true
      try {
        await kickEdgeFunction(campaign.id, webhookUrl)
      } catch {
        // Silent — edge function handles errors internally
      } finally {
        tickInFlight.current = false
      }
    },
    [clientId, connection]
  )

  return (
    <CampaignExecutorContext.Provider
      value={{ activeCampaignId, launching, launch, pause, retryFailed, resetStuckLeads, tick }}
    >
      {children}
    </CampaignExecutorContext.Provider>
  )
}

export function useCampaignExecutor() {
  const ctx = useContext(CampaignExecutorContext)
  if (!ctx) throw new Error('useCampaignExecutor must be used within CampaignExecutorProvider')
  return ctx
}
