import type { ChatMessage as ChatMessageType } from '@/data/types'

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isAi = message.sender === 'ai'

  return (
    <div className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
      {isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground">AI</span>
        </div>
      )}

      <div className={`max-w-[75%] ${isAi ? '' : 'order-first'}`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isAi
              ? 'bg-card border-l-[3px] border-l-primary'
              : 'bg-muted'
          }`}
        >
          {isAi && (
            <p className="text-xs font-semibold text-primary mb-1">
              Sales Infra Assistant
            </p>
          )}
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className={`text-[11px] text-muted-foreground mt-1 ${isAi ? '' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {!isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-[10px] font-semibold text-muted-foreground">You</span>
        </div>
      )}
    </div>
  )
}
