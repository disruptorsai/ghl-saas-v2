import { useState, useRef, useEffect } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatThreads, useChatMessages } from '@/hooks/useChatThreads'
import type { ChatThread } from '@/hooks/useChatThreads'

function ThreadItem({
  thread,
  isSelected,
  onSelect,
  onDelete,
}: {
  thread: ChatThread
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`group flex items-center justify-between gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MessageSquare className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{thread.title}</p>
          <p
            className={`text-xs truncate ${
              isSelected
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            }`}
          >
            {new Date(thread.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
          isSelected
            ? 'hover:bg-primary-foreground/20 text-primary-foreground'
            : ''
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default function ChatWithAi() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    threads,
    loading: threadsLoading,
    createThread,
    deleteThread,
  } = useChatThreads()
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
  } = useChatMessages(selectedThreadId)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreateThread = async () => {
    try {
      const thread = await createThread()
      setSelectedThreadId(thread.id)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleDeleteThread = async (id: string) => {
    try {
      if (selectedThreadId === id) {
        setSelectedThreadId(null)
      }
      await deleteThread(id)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId || sending) return
    const content = messageInput.trim()
    setMessageInput('')
    setSending(true)
    try {
      await sendMessage(content)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <CredentialGate>
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Chat with AI</h1>
        <p className="text-muted-foreground">
          Interact with your AI assistant
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Thread List - Left Panel */}
        <Card className="w-72 shrink-0 flex flex-col py-0">
          <div className="p-3 border-b">
            <Button
              className="w-full"
              size="sm"
              onClick={handleCreateThread}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {threadsLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 px-4">
                  No conversations yet. Click &quot;New Chat&quot; to start.
                </p>
              ) : (
                threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedThreadId === thread.id}
                    onSelect={() => setSelectedThreadId(thread.id)}
                    onDelete={() => handleDeleteThread(thread.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Messages - Right Panel */}
        <Card className="flex-1 flex flex-col py-0">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Select a conversation
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a thread from the left or start a new chat.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <Skeleton className="h-16 w-64 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No messages yet. Send a message to start the
                        conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === 'user'
                                ? 'text-primary-foreground/60'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                    size="icon"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
    </CredentialGate>
  )
}
