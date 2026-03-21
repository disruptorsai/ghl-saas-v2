import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Trash2, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useModelList, type Provider } from '@/hooks/useModelList'
import { useCredentials } from '@/hooks/useCredentials'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface PromptPlaygroundProps {
  systemPrompt: string
  onApplyPrompt: (newContent: string) => void
}

/** Extract the last fenced code block from a message */
function extractCodeBlock(text: string): string | null {
  const matches = [...text.matchAll(/```(?:\w*)\n([\s\S]*?)```/g)]
  if (matches.length === 0) return null
  return matches[matches.length - 1][1].trim()
}

/** Simple line diff — returns lines tagged as added, removed, or unchanged */
interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: DiffLine[] = []

  // Simple LCS-based diff
  const lcs = buildLCS(oldLines, newLines)
  let oi = 0, ni = 0, li = 0
  while (oi < oldLines.length || ni < newLines.length) {
    if (li < lcs.length && oi < oldLines.length && oldLines[oi] === lcs[li] &&
        ni < newLines.length && newLines[ni] === lcs[li]) {
      result.push({ type: 'unchanged', text: oldLines[oi] })
      oi++; ni++; li++
    } else if (ni >= newLines.length || (oi < oldLines.length &&
        (li >= lcs.length || oldLines[oi] !== lcs[li]))) {
      result.push({ type: 'removed', text: oldLines[oi] })
      oi++
    } else {
      result.push({ type: 'added', text: newLines[ni] })
      ni++
    }
  }
  return result
}

function buildLCS(a: string[], b: string[]): string[] {
  const m = a.length, n = b.length
  // For very large prompts, fall back to simple comparison
  if (m * n > 100000) {
    return a.filter((line) => b.includes(line))
  }
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const result: string[] = []
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { result.unshift(a[i - 1]); i--; j-- }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--
    else j--
  }
  return result
}

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const lines = computeDiff(oldText, newText)
  return (
    <div className="rounded border bg-muted/30 p-2 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto mt-2">
      {lines.map((line, i) => (
        <div
          key={i}
          className={
            line.type === 'added'
              ? 'bg-green-500/20 text-green-400'
              : line.type === 'removed'
                ? 'bg-red-500/20 text-red-400 line-through'
                : 'text-muted-foreground'
          }
        >
          <span className="select-none mr-2 opacity-50">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          {line.text || '\u00A0'}
        </div>
      ))}
    </div>
  )
}

const EDITOR_SYSTEM = `You are a prompt engineering assistant. Your job is to help the user edit, improve, and refine the AI prompt they are working on.

The user's current prompt content is shown below between <current_prompt> tags. When the user asks you to make changes (add text, rewrite sections, improve tone, etc.), respond with the FULL updated prompt inside a fenced code block (\`\`\`).

Rules:
- Always output the complete updated prompt in a code block, not just the changed parts.
- Keep your explanations brief — focus on delivering the updated prompt.
- If the user asks a question about the prompt (without requesting changes), answer concisely without a code block.
- Preserve the existing formatting and structure unless asked to change it.
- You have full conversation memory — remember all prior edits in this session.`

export function PromptPlayground({ systemPrompt, onApplyPrompt }: PromptPlaygroundProps) {
  const { credentials } = useCredentials()

  const hasOpenRouter = !!credentials?.openrouter_api_key
  const hasOpenAI = !!credentials?.openai_api_key
  const hasAny = hasOpenRouter || hasOpenAI

  const defaultProvider: Provider = hasOpenRouter ? 'openrouter' : 'openai'
  const [provider, setProvider] = useState<Provider>(defaultProvider)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const apiKey =
    provider === 'openrouter'
      ? credentials?.openrouter_api_key
      : credentials?.openai_api_key

  const { models, loading: modelsLoading } = useModelList(provider, apiKey)

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id)
    }
  }, [models, selectedModel])

  useEffect(() => {
    setSelectedModel('')
  }, [provider])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleApply = (messageIndex: number, content: string) => {
    const code = extractCodeBlock(content)
    if (code) {
      onApplyPrompt(code)
      setAppliedIndices((prev) => new Set(prev).add(messageIndex))
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel || !apiKey || streaming) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const endpoint =
      provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions'

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin
    }

    const contextMessage = `${EDITOR_SYSTEM}\n\n<current_prompt>\n${systemPrompt}\n</current_prompt>`

    const apiMessages = [
      { role: 'system' as const, content: contextMessage },
      ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
    ]

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              assistantContent += delta
              const content = assistantContent
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content }
                return updated
              })
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to get response'
      setMessages((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].role === 'assistant' &&
          !prev[prev.length - 1].content
        ) {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${errorMsg}`,
          }
          return updated
        }
        return [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort()
    setMessages([])
    setAppliedIndices(new Set())
    setStreaming(false)
  }

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Configure an OpenRouter or OpenAI API key in{' '}
          <span className="font-semibold text-foreground">Credentials</span> to
          use the playground.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Provider + Model Selection */}
      <div className="space-y-3 pb-3 border-b">
        {hasOpenRouter && hasOpenAI && (
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground min-w-0">Provider</Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${provider === 'openai' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              >
                OpenAI
              </span>
              <Switch
                checked={provider === 'openrouter'}
                onCheckedChange={(checked) =>
                  setProvider(checked ? 'openrouter' : 'openai')
                }
              />
              <span
                className={`text-xs ${provider === 'openrouter' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              >
                OpenRouter
              </span>
            </div>
          </div>
        )}

        {!(hasOpenRouter && hasOpenAI) && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <span className="text-xs font-medium">
              {hasOpenRouter ? 'OpenRouter' : 'OpenAI'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground min-w-0">Model</Label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={modelsLoading || models.length === 0}
          >
            <SelectTrigger className="flex-1 h-8 text-xs">
              <SelectValue
                placeholder={
                  modelsLoading ? 'Loading models...' : 'Select a model'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 py-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-xs text-muted-foreground text-center">
              Ask the AI to help edit your prompt.
              <br />
              e.g. "make it more concise" or "add a greeting section"
            </p>
          </div>
        ) : (
          <div className="space-y-3 pr-2">
            {messages.map((msg, i) => {
              const codeBlock =
                msg.role === 'assistant' ? extractCodeBlock(msg.content) : null
              const isApplied = appliedIndices.has(i)
              // Text outside code blocks for display
              const textWithoutCode = msg.content
                .replace(/```(?:\w*)\n[\s\S]*?```/g, '')
                .trim()

              return (
                <div key={i}>
                  <div
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.role === 'assistant' && codeBlock && !streaming ? (
                        <>
                          {textWithoutCode && (
                            <p className="whitespace-pre-wrap break-words mb-2">
                              {textWithoutCode}
                            </p>
                          )}
                          <DiffView oldText={systemPrompt} newText={codeBlock} />
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content || (streaming ? '...' : '')}
                        </p>
                      )}
                    </div>
                  </div>
                  {codeBlock && !streaming && (
                    <div className="flex justify-start mt-1 ml-1">
                      <Button
                        size="sm"
                        variant={isApplied ? 'secondary' : 'default'}
                        className="h-6 text-xs px-2 gap-1"
                        onClick={() => handleApply(i, msg.content)}
                        disabled={isApplied}
                      >
                        <Check className="h-3 w-3" />
                        {isApplied ? 'Applied' : 'Apply to prompt'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input + Actions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. make it shorter, add a FAQ section..."
          className="flex-1 h-8 text-xs"
          disabled={streaming || !selectedModel}
        />
        <Button
          size="icon"
          variant="default"
          onClick={sendMessage}
          disabled={!input.trim() || streaming || !selectedModel}
          className="h-8 w-8 shrink-0"
        >
          {streaming ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={clearChat}
          disabled={messages.length === 0 && !streaming}
          className="h-8 w-8 shrink-0"
          title="Clear chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
