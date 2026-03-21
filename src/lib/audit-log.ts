import { supabase } from '@/lib/supabase'

export interface AuditLogEntry {
  clientId: string
  userId?: string
  userEmail?: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      client_id: entry.clientId,
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      entity_name: entry.entityName,
      details: entry.details || {},
    })
  } catch {
    // Audit logging should never break the app - fail silently
    console.warn('Failed to write audit log')
  }
}
