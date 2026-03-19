import { useState, useRef, useEffect } from 'react'
import type { ChatMessage as ChatMessageType } from '@/data/types'
import { getResponse, welcomeMessage } from '@/data/chat-responses'
import { ChatMessage } from '@/components/support/ChatMessage'
import { ChatInput } from '@/components/support/ChatInput'

function makeMessage(sender: 'user' | 'ai', content: string): ChatMessageType {
  return {
    id: crypto.randomUUID(),
    sender,
    content,
    timestamp: new Date().toISOString(),
  }
}

export default function Support() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    makeMessage('ai', welcomeMessage),
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(text: string) {
    const userMsg = makeMessage('user', text)
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const delay = 500 + Math.random() * 300
    setTimeout(() => {
      const aiMsg = makeMessage('ai', getResponse(text))
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, delay)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-[800px] flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about your setup
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">AI</span>
              </div>
              <div className="bg-card rounded-lg px-4 py-3 border-l-[3px] border-l-primary">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      </div>
    </div>
  )
}
