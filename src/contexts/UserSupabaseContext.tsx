import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createUserSupabase } from '@/lib/user-supabase'

/** Full client row from the main `clients` table. */
export interface ClientData {
  id: string
  name: string
  email: string | null
  description: string | null
  image_url: string | null
  logo_url: string | null
  agency_id: string
  supabase_url: string | null
  supabase_service_key: string | null
  migration_status: string | null
  migration_error: string | null
  // Credentials
  openrouter_api_key: string | null
  openai_api_key: string | null
  ghl_api_key: string | null
  ghl_assignee_id: string | null
  ghl_calendar_id: string | null
  ghl_location_id: string | null
  retell_api_key: string | null
  retell_inbound_agent_id: string | null
  retell_outbound_agent_id: string | null
  retell_outbound_followup_agent_id: string | null
  retell_agent_id_4: string | null
  retell_phone_1: string | null
  retell_phone_2: string | null
  retell_phone_3: string | null
  // Webhook URLs
  prompt_webhook_url: string | null
  knowledge_base_add_webhook_url: string | null
  knowledge_base_delete_webhook_url: string | null
  text_engine_webhook: string | null
  text_engine_followup_webhook: string | null
  transfer_to_human_webhook_url: string | null
  user_details_webhook_url: string | null
  update_pipeline_webhook_url: string | null
  lead_score_webhook_url: string | null
  save_reply_webhook_url: string | null
  outbound_caller_webhook_1_url: string | null
  outbound_caller_webhook_2_url: string | null
  outbound_caller_webhook_3_url: string | null
  database_reactivation_inbound_webhook_url: string | null
  campaign_webhook_url: string | null
  campaign_orchestrator_webhook_url: string | null
  analytics_webhook_url: string | null
  ai_chat_webhook_url: string | null
  // Meta
  created_at: string
  updated_at: string
}

interface ClientSupabaseContextType {
  /** Dynamic Supabase client pointing at the CLIENT's project. */
  clientDb: SupabaseClient | null
  clientId: string | null
  /** True when the client has a connected + migrated Supabase project. */
  isConnected: boolean
  connectionLoading: boolean
  /** Full client row from main DB (credentials, metadata, etc.). */
  connection: ClientData | null
  refetchConnection: () => Promise<void>
}

const ClientSupabaseContext = createContext<ClientSupabaseContextType>({
  clientDb: null,
  clientId: null,
  isConnected: false,
  connectionLoading: true,
  connection: null,
  refetchConnection: async () => {},
})

export function ClientSupabaseProvider({ children }: { children: ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>()
  const [connection, setConnection] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConnection = async () => {
    if (!clientId) { setLoading(false); return }
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
    setConnection(data)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchConnection()

    // Realtime: auto-refresh when the client row changes (e.g. credentials saved)
    if (!clientId) return
    const channel = supabase
      .channel(`client-row-${clientId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clients', filter: `id=eq.${clientId}` },
        () => fetchConnection()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId])

  // Create a dynamic Supabase client for the client's own project
  const clientDb = useMemo(() => {
    if (connection?.supabase_url && connection?.supabase_service_key) {
      return createUserSupabase(connection.supabase_url, connection.supabase_service_key)
    }
    return null
  }, [connection?.supabase_url, connection?.supabase_service_key])

  const isConnected =
    connection?.migration_status === 'completed' &&
    !!connection?.supabase_url &&
    !!connection?.supabase_service_key

  return (
    <ClientSupabaseContext.Provider
      value={{
        clientDb,
        clientId: clientId || null,
        isConnected,
        connectionLoading: loading,
        connection,
        refetchConnection: fetchConnection,
      }}
    >
      {children}
    </ClientSupabaseContext.Provider>
  )
}

export function useClientSupabase() {
  return useContext(ClientSupabaseContext)
}
