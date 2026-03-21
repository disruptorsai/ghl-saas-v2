import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export interface Lead {
  id: string
  campaign_id: string
  name: string | null
  email: string | null
  phone: string | null
  data: Record<string, unknown> | null
  status: string
  scheduled_for: string | null
  processed_at: string | null
  error_message: string | null
  created_at: string
}

export interface LeadCounts {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
}

/**
 * Paginated leads hook — designed for large volumes.
 * Fetches leads server-side with pagination, filtering, and sorting.
 * Realtime updates only refresh counts + current page (not all leads).
 */
export function useLeads(campaignId: string) {
  const { clientDb } = useClientSupabase()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<LeadCounts>({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 })

  // Pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [totalFiltered, setTotalFiltered] = useState(0)

  // Fetch counts (lightweight — no data transfer)
  const fetchCounts = useCallback(async () => {
    if (!clientDb || !campaignId) return
    const statuses = ['pending', 'processing', 'completed', 'failed'] as const
    const results = await Promise.all(
      statuses.map((s) =>
        clientDb
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campaignId)
          .eq('status', s)
      )
    )
    const [pending, processing, completed, failed] = results.map((r) => r.count ?? 0)
    const total = pending + processing + completed + failed
    setCounts({ total, pending, processing, completed, failed })
  }, [clientDb, campaignId])

  // Fetch current page of leads
  const fetchPage = useCallback(async (silent = false) => {
    if (!clientDb || !campaignId) { setLoading(false); return }
    if (!silent) setLoading(true)

    let query = clientDb
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q}`)
    }

    const { data, error, count } = await query
    if (!error && data) {
      setLeads(data)
      setTotalFiltered(count ?? data.length)
    }
    setLoading(false)
  }, [clientDb, campaignId, page, pageSize, statusFilter, searchQuery])

  // Fetch both on mount and when params change
  useEffect(() => {
    fetchPage()
    fetchCounts()
  }, [fetchPage, fetchCounts])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [statusFilter, searchQuery, pageSize])

  // Realtime — only refresh counts + current page (not ALL leads)
  useEffect(() => {
    if (!clientDb || !campaignId) return
    const channel = clientDb
      .channel(`leads-${campaignId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `campaign_id=eq.${campaignId}` }, () => {
        fetchCounts()
        fetchPage(true)
      })
      .subscribe()
    return () => { clientDb.removeChannel(channel) }
  }, [clientDb, campaignId, fetchCounts, fetchPage])

  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))

  return {
    leads,
    loading,
    counts,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered,
    // Filters
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    // Actions
    refetch: () => { fetchPage(); fetchCounts() },
  }
}
