import { supabase } from '@/lib/supabase'

export interface NotificationData {
  clientId: string
  userId?: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  entityType?: string
  entityId?: string
  link?: string
}

export async function createNotification(data: NotificationData): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      client_id: data.clientId,
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      entity_type: data.entityType,
      entity_id: data.entityId,
      link: data.link,
    })
  } catch {
    console.warn('Failed to create notification')
  }
}
