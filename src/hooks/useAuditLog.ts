import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export interface AuditLogRecord {
  id: string
  client_id: string
  user_id: string | null
  user_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

interface UseAuditLogFilters {
  action?: string
  entityType?: string
  dateRange?: 'today' | '7days' | '30days' | 'all'
}

const PAGE_SIZE = 50

export function useAuditLog(clientId: string | undefined, filters?: UseAuditLogFilters) {
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)

  const buildQuery = useCallback(
    (offset: number) => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action)
      }
      if (filters?.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        let since: Date
        if (filters.dateRange === 'today') {
          since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (filters.dateRange === '7days') {
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else {
          since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        query = query.gte('created_at', since.toISOString())
      }

      return query
    },
    [clientId, filters?.action, filters?.entityType, filters?.dateRange]
  )

  const fetchLogs = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    pageRef.current = 0

    const { data } = await buildQuery(0)
    setLogs(data ?? [])
    setHasMore((data?.length ?? 0) === PAGE_SIZE)
    setLoading(false)
  }, [clientId, buildQuery])

  const loadMore = useCallback(async () => {
    if (!clientId || !hasMore) return
    const nextOffset = (pageRef.current + 1) * PAGE_SIZE
    pageRef.current += 1

    const { data } = await buildQuery(nextOffset)
    if (data && data.length > 0) {
      setLogs((prev) => [...prev, ...data])
    }
    setHasMore((data?.length ?? 0) === PAGE_SIZE)
  }, [clientId, hasMore, buildQuery])

  // Initial fetch + re-fetch on filter change
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Realtime subscription for new entries
  useEffect(() => {
    if (!clientId) return

    const channel = supabase
      .channel(`audit_logs:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as AuditLogRecord, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId])

  return { logs, loading, refetch: fetchLogs, hasMore, loadMore }
}
