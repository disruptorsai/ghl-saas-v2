import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export interface Call {
  id: string
  created_at: string
  event_type: string
  status: string
  details: string | null
  phone_number: string | null
  duration: number | null
  recording_url: string | null
  webhook_response: Record<string, unknown> | null
}

/**
 * Parse a phone number from webhook_response JSONB,
 * trying common field names.
 */
function extractPhone(wr: Record<string, unknown> | null): string | null {
  if (!wr) return null
  return (
    (wr.phone_number as string) ??
    (wr.to_number as string) ??
    (wr.from_number as string) ??
    (wr.phone as string) ??
    null
  )
}

function extractDuration(wr: Record<string, unknown> | null): number | null {
  if (!wr) return null
  const val = wr.duration ?? wr.call_duration ?? wr.duration_seconds ?? null
  if (val === null || val === undefined) return null
  const num = Number(val)
  return Number.isFinite(num) ? num : null
}

function extractRecordingUrl(wr: Record<string, unknown> | null): string | null {
  if (!wr) return null
  return (
    (wr.recording_url as string) ??
    (wr.recordingUrl as string) ??
    (wr.recording as string) ??
    null
  )
}

function parseCall(row: Record<string, unknown>): Call {
  const wr = (row.webhook_response as Record<string, unknown>) ?? null
  return {
    id: row.id as string,
    created_at: row.created_at as string,
    event_type: (row.event_type as string) ?? '',
    status: (row.status as string) ?? 'unknown',
    details: (row.details as string) ?? null,
    phone_number: extractPhone(wr),
    duration: extractDuration(wr),
    recording_url: extractRecordingUrl(wr),
    webhook_response: wr,
  }
}

export function useCallHistory() {
  const { clientDb, clientId } = useClientSupabase()
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCalls = useCallback(
    async (silent = false) => {
      if (!clientDb || !clientId) {
        setLoading(false)
        return
      }
      if (!silent) setLoading(true)
      const { data, error } = await clientDb
        .from('execution_logs')
        .select('*')
        .eq('client_id', clientId)
        .in('event_type', [
          'voice_call',
          'call_started',
          'call_ended',
          'call_completed',
          'call_failed',
          'inbound_call',
          'outbound_call',
        ])
        .order('created_at', { ascending: false })
        .limit(100)
      if (!error && data) {
        setCalls(data.map(parseCall))
      }
      setLoading(false)
    },
    [clientDb, clientId],
  )

  useEffect(() => {
    fetchCalls()

    if (!clientDb || !clientId) return

    const channel = clientDb
      .channel(`call-history-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'execution_logs',
          filter: `client_id=eq.${clientId}`,
        },
        () => fetchCalls(true),
      )
      .subscribe()

    return () => {
      clientDb.removeChannel(channel)
    }
  }, [fetchCalls, clientDb, clientId])

  return { calls, loading, refetch: fetchCalls }
}
