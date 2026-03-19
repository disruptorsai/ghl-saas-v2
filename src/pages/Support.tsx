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
          <h1 className="text-2xl font-bold tracking-tight text-white">Support</h1>
          <p className="text-sm text-gray-400 mt-1">
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
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-[10px] font-bold text-black">AI</span>
              </div>
              <div className="bg-[hsl(222,14%,13%)] rounded-xl px-4 py-3 border border-amber-500/20 border-l-[3px] border-l-amber-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 typing-dot" />
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
