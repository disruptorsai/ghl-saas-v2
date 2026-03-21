import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import type { ClientData } from '@/contexts/UserSupabaseContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { logAuditEvent } from '@/lib/audit-log'

/**
 * Mapping from our snake_case client fields → PascalCase API_Custom_Fields_Management columns.
 * Only fields that exist in both are mapped.
 */
const FIELD_MAP: Partial<Record<keyof ClientData, string>> = {
  ghl_api_key: 'GHL_API_Key',
  ghl_calendar_id: 'Calendar_ID',
  ghl_location_id: 'Location_ID',
  ghl_assignee_id: 'Assignee_ID',
  openai_api_key: 'OpenAI_API_key',
  openrouter_api_key: 'OpenRouter_API_key',
  text_engine_webhook: 'Text_Engine_Webhook',
  text_engine_followup_webhook: 'Text_Engine_Followup_Webhook',
  retell_api_key: 'retell_api_key',
  retell_inbound_agent_id: 'retell_inbound_agent_id',
  retell_outbound_agent_id: 'retell_outbound_agent_id',
  retell_phone_1: 'retell_phone_1',
  retell_phone_2: 'retell_phone_2',
  retell_phone_3: 'retell_phone_3',
  transfer_to_human_webhook_url: 'Transfer_To_human_Inbound_Webhook',
  user_details_webhook_url: 'User_Details_Inbound_Webhook',
  database_reactivation_inbound_webhook_url: 'Database_Reactivation_Inbound_Webhook',
}

/**
 * Credentials are stored on the main `clients` table AND synced to
 * `API_Custom_Fields_Management` in the client's Supabase for n8n.
 */
export function useCredentials() {
  const { connection, connectionLoading, clientId, clientDb, refetchConnection } =
    useClientSupabase()
  const { user } = useAuth()

  const updateCredentials = async (updates: Partial<ClientData>) => {
    if (!clientId) throw new Error('No client selected')

    // 1. Save to main clients table (for UI credential checks)
    const { error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clientId)
    if (error) throw error

    // 2. Sync mapped fields to client's API_Custom_Fields_Management (for n8n)
    if (clientDb) {
      const n8nUpdates: Record<string, string> = {}
      for (const [ourKey, n8nKey] of Object.entries(FIELD_MAP)) {
        if (ourKey in updates) {
          n8nUpdates[n8nKey] = (updates as Record<string, string>)[ourKey] ?? ''
        }
      }
      if (Object.keys(n8nUpdates).length > 0) {
        try {
          // Upsert: get existing row or create one
          const { data: existing, error: selectErr } = await clientDb
            .from('API_Custom_Fields_Management')
            .select('id')
            .limit(1)
            .maybeSingle()
          if (selectErr) {
            console.error('[Credentials] Failed to query API_Custom_Fields_Management:', selectErr)
          } else if (existing) {
            const { error: updateErr } = await clientDb
              .from('API_Custom_Fields_Management')
              .update(n8nUpdates)
              .eq('id', existing.id)
            if (updateErr) console.error('[Credentials] Failed to update API_Custom_Fields_Management:', updateErr)
            else console.log('[Credentials] Synced to client API_Custom_Fields_Management (update)')
          } else {
            const { error: insertErr } = await clientDb.from('API_Custom_Fields_Management').insert(n8nUpdates)
            if (insertErr) console.error('[Credentials] Failed to insert API_Custom_Fields_Management:', insertErr)
            else console.log('[Credentials] Synced to client API_Custom_Fields_Management (insert)')
          }
        } catch (syncErr) {
          console.error('[Credentials] Client DB sync failed:', syncErr)
        }
      }
    } else {
      console.warn('[Credentials] clientDb is null — skipping API_Custom_Fields_Management sync. Check client supabase_url/supabase_service_key.')
    }

    await refetchConnection()

    if (clientId) {
      const changedKeys = Object.keys(updates).filter((k) => (updates as Record<string, string>)[k]?.trim())
      logAuditEvent({ clientId, userId: user?.id, userEmail: user?.email ?? undefined, action: 'updated', entityType: 'credential', details: { fields: changedKeys } })
    }
  }

  return {
    credentials: connection,
    loading: connectionLoading,
    updateCredentials,
    refetch: refetchConnection,
  }
}
