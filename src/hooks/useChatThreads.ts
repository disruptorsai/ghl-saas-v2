import { useState, useEffect, useCallback } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export interface ChatThread {
  id: string
  title: string
  created_at: string
}

export interface ChatMessage {
  id: string
  thread_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_type: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export function useChatThreads() {
  const { clientDb, clientId } = useClientSupabase()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)

  const fetchThreads = useCallback(async () => {
    if (!clientDb || !clientId) { setLoading(false); return }
    setLoading(true)
    const { data } = await clientDb
      .from('prompt_chat_threads')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setThreads(data)
    setLoading(false)
  }, [clientDb])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const createThread = async (title?: string) => {
    if (!clientDb || !clientId) throw new Error('Client not connected')
    const { data, error } = await clientDb
      .from('prompt_chat_threads')
      .insert({ title: title || 'New Chat' })
      .select()
      .single()
    if (error) throw error
    await fetchThreads()
    return data
  }

  const deleteThread = async (id: string) => {
    if (!clientDb) throw new Error('Client not connected')
    await clientDb.from('prompt_chat_messages').delete().eq('thread_id', id)
    await clientDb.from('prompt_chat_threads').delete().eq('id', id)
    await fetchThreads()
  }

  return { threads, loading, createThread, deleteThread, refetch: fetchThreads }
}

export function useChatMessages(threadId: string | null) {
  const { clientDb } = useClientSupabase()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!threadId || !clientDb) {
      setMessages([])
      return
    }
    setLoading(true)
    const { data } = await clientDb
      .from('prompt_chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as ChatMessage[])
    setLoading(false)
  }, [threadId, clientDb])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const sendMessage = async (content: string) => {
    if (!threadId || !clientDb) return
    const { error } = await clientDb.from('prompt_chat_messages').insert({
      thread_id: threadId,
      role: 'user',
      content,
      message_type: 'text',
    })
    if (error) throw error
    await fetchMessages()
  }

  return { messages, loading, sendMessage, refetch: fetchMessages }
}
