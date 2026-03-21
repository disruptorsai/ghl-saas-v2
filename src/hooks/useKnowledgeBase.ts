import { useState, useEffect } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { toast } from 'sonner'

export interface KBDocument {
  id: number
  content: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * Knowledge base uses the `documents` table in the client's Supabase.
 * This is the same table n8n uses for vector embeddings.
 * Title and tags are stored inside the `metadata` JSONB field.
 */
export function useKnowledgeBase() {
  const { clientDb, clientId } = useClientSupabase()
  const [documents, setDocuments] = useState<KBDocument[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await clientDb
      .from('documents')
      .select('id, content, metadata, created_at, updated_at')
      .order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load knowledge base'); console.error(error) }
    else setDocuments(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDocuments() }, [clientDb])

  const addDocument = async (content: string, metadata?: Record<string, unknown>) => {
    if (!clientDb || !clientId) throw new Error('Not connected')
    const { data, error } = await clientDb
      .from('documents')
      .insert({ content, metadata: metadata || {} })
      .select('id, content, metadata, created_at, updated_at')
      .single()
    if (error) throw error
    await fetchDocuments()
    return data
  }

  const updateDocument = async (id: number, content: string, metadata?: Record<string, unknown>) => {
    if (!clientDb) throw new Error('Not connected')
    const updates: Record<string, unknown> = { content }
    if (metadata !== undefined) updates.metadata = metadata
    const { error } = await clientDb.from('documents').update(updates).eq('id', id)
    if (error) throw error
    await fetchDocuments()
  }

  const deleteDocument = async (id: number) => {
    if (!clientDb) throw new Error('Not connected')
    const { error } = await clientDb.from('documents').delete().eq('id', id)
    if (error) throw error
    await fetchDocuments()
  }

  return { documents, loading, addDocument, updateDocument, deleteDocument, refetch: fetchDocuments }
}
