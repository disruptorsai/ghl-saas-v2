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
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <span className="text-[10px] font-bold text-black">AI</span>
        </div>
      )}

      <div className={`max-w-[75%] ${isAi ? '' : 'order-first'}`}>
        <div
          className={`rounded-xl px-4 py-3 ${
            isAi
              ? 'bg-[hsl(222,14%,13%)] border border-amber-500/20 border-l-[3px] border-l-amber-500'
              : 'bg-[hsl(222,14%,16%)] border border-border'
          }`}
        >
          {isAi && (
            <p className="text-xs font-semibold text-amber-400 mb-1.5">
              Sales Infra Assistant
            </p>
          )}
          <p className="text-sm text-gray-200 leading-relaxed">{message.content}</p>
        </div>
        <p className={`text-[11px] text-gray-500 mt-1.5 ${isAi ? '' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {!isAi && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[hsl(222,14%,20%)] flex items-center justify-center border border-border">
          <span className="text-[10px] font-semibold text-gray-400">You</span>
        </div>
      )}
    </div>
  )
}
