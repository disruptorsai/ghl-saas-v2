import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { createNotification } from '@/lib/notifications'
import { logAuditEvent } from '@/lib/audit-log'
import { toast } from 'sonner'

export interface FeedbackEntry {
  id: string
  client_id: string
  user_id: string | null
  user_email: string | null
  workflow: string
  rating: number | null
  comment: string | null
  status: string
  created_at: string
}

interface UseFeedbackOptions {
  workflow?: string
}

export function useFeedback(clientId: string | undefined | null, options?: UseFeedbackOptions) {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    if (!clientId) { setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('client_feedback')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (options?.workflow) {
      query = query.eq('workflow', options.workflow)
    }

    const { data, error } = await query
    if (error) {
      toast.error('Failed to load feedback')
      console.error(error)
    } else {
      setFeedback(data || [])
    }
    setLoading(false)
  }, [clientId, options?.workflow])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  // Realtime subscription for new feedback
  useEffect(() => {
    if (!clientId) return

    const channel = supabase
      .channel(`client-feedback-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_feedback',
          filter: `client_id=eq.${clientId}`,
        },
        () => fetchFeedback()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, fetchFeedback])

  const submitFeedback = async (data: {
    workflow: string
    rating?: number
    comment: string
  }) => {
    if (!clientId) throw new Error('No client selected')

    const { error } = await supabase.from('client_feedback').insert({
      client_id: clientId,
      user_id: user?.id || null,
      user_email: user?.email || null,
      workflow: data.workflow,
      rating: data.rating || null,
      comment: data.comment,
      status: 'new',
    })

    if (error) throw error

    // Create notification for Bryan's team
    await createNotification({
      clientId,
      userId: user?.id,
      title: 'New Feedback',
      message: `${data.workflow.replace(/_/g, ' ')} feedback${data.rating ? ` (${data.rating}/5 stars)` : ''}: ${data.comment.slice(0, 100)}`,
      type: 'info',
      entityType: 'feedback',
    })

    // Audit log
    await logAuditEvent({
      clientId,
      userId: user?.id,
      userEmail: user?.email || undefined,
      action: 'create',
      entityType: 'feedback',
      entityName: data.workflow,
      details: {
        workflow: data.workflow,
        rating: data.rating,
        comment: data.comment,
      },
    })

    await fetchFeedback()
  }

  const updateStatus = async (id: string, status: string) => {
    if (!clientId) throw new Error('No client selected')

    const { error } = await supabase
      .from('client_feedback')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    await fetchFeedback()
  }

  return { feedback, loading, submitFeedback, updateStatus, refetch: fetchFeedback }
}
