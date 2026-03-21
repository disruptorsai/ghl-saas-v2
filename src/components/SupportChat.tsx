import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import { useClientConfig } from '@/hooks/useClientConfig'

interface ChatMessage {
  id: string
  client_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export function SupportChat() {
  const { clientId } = useParams<{ clientId: string }>()
  const { config } = useClientConfig(clientId ?? '')
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load messages when chat opens
  useEffect(() => {
    if (!open || !clientId) return

    const loadMessages = async () => {
      setLoadingMessages(true)
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data as ChatMessage[])
      }
      setLoadingMessages(false)
    }

    loadMessages()
  }, [open, clientId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, open, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  // Realtime subscription
  useEffect(() => {
    if (!open || !clientId) return

    const channel = supabase
      .channel(`support-chat-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, clientId])

  const sendMessage = async () => {
    if (!input.trim() || !clientId || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      // Insert user message
      const { data: userMsg, error: insertError } = await supabase
        .from('support_chat_messages')
        .insert({ client_id: clientId, role: 'user', content })
        .select()
        .single()

      if (insertError) throw insertError

      // Optimistically add user message if not added by realtime yet
      setMessages((prev) => {
        if (prev.some((m) => m.id === (userMsg as ChatMessage).id)) return prev
        return [...prev, userMsg as ChatMessage]
      })

      // If client has ai_chat_webhook_url, send to webhook for AI response
      const webhookUrl = config?.ai_chat_webhook_url as string | undefined
      if (webhookUrl) {
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientId,
              message: content,
              message_id: (userMsg as ChatMessage).id,
            }),
          })

          if (res.ok) {
            const data = await res.json()
            if (data?.reply || data?.content || data?.message) {
              const replyContent = data.reply || data.content || data.message
              await supabase
                .from('support_chat_messages')
                .insert({
                  client_id: clientId,
                  role: 'assistant',
                  content: replyContent,
                })
            }
          }
        } catch {
          // Webhook failed silently — message is still stored for manual support
        }
      }
    } catch {
      // Re-add the input on failure
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!clientId) return null

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          title="Open support chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[350px] h-[450px] rounded-xl border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Support</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No messages yet. Send a message to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : msg.role === 'system'
                            ? 'bg-muted text-muted-foreground italic'
                            : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          msg.role === 'user'
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground/60'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Bar */}
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 text-sm"
              disabled={sending}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="h-9 w-9 flex-shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
