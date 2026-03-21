import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  client_id: string
  user_id: string | null
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  entity_type: string | null
  entity_id: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications(clientId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!clientId) {
      setNotifications([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data) {
      setNotifications(data as Notification[])
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription
  useEffect(() => {
    if (!clientId) return

    const channel = supabase
      .channel(`notifications-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = useCallback(
    async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    },
    []
  )

  const markAllAsRead = useCallback(async () => {
    if (!clientId) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('client_id', clientId)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }, [clientId])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
