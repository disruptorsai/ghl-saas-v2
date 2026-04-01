import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Bot,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCredentials } from '@/hooks/useCredentials'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { usePrompts, type Prompt } from '@/hooks/usePrompts'
import { useModelList, type Provider } from '@/hooks/useModelList'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: 'gpt-4o',
  openrouter: 'openai/gpt-4o',
}

export default function DebugTextAi() {
  const { clientId } = useClientSupabase()
  const { credentials, loading: credLoading } = useCredentials()
  const { prompts, loading: promptsLoading } = usePrompts('text')

  // LLM config
  const hasOpenRouter = !!credentials?.openrouter_api_key
  const hasOpenAI = !!credentials?.openai_api_key
  const hasAnyKey = hasOpenRouter || hasOpenAI
  const defaultProvider: Provider = hasOpenRouter ? 'openrouter' : 'openai'

  const [provider, setProvider] = useState<Provider>(defaultProvider)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isDefaultModel, setIsDefaultModel] = useState(true)

  const apiKey =
    provider === 'openrouter'
      ? credentials?.openrouter_api_key
      : credentials?.openai_api_key

  const { models, loading: modelsLoading } = useModelList(provider, apiKey)

  // Agent selection
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Filter to agents with content (skip persona at ID 0, skip empty slots)
  const personaPrompt = prompts.find(p => p.category === 'persona')
  const availableAgents = prompts.filter(
    p => p.category !== 'persona' && p.content && p.content.trim().length > 0
  )

  // Set default model when models load
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const defaultId = DEFAULT_MODELS[provider]
      const hasDefault = models.some(m => m.id === defaultId)
      setSelectedModel(hasDefault ? defaultId : models[0].id)
      setIsDefaultModel(true)
    }
  }, [models, selectedModel, provider])

  // Reset model when provider changes
  useEffect(() => {
    setSelectedModel('')
    setIsDefaultModel(true)
  }, [provider])

  // Update provider when credentials change
  useEffect(() => {
    if (!credLoading) {
      setProvider(hasOpenRouter ? 'openrouter' : 'openai')
    }
  }, [credLoading, hasOpenRouter])

  // Auto-select first agent
  useEffect(() => {
    if (availableAgents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(`${availableAgents[0].id}`)
    }
  }, [availableAgents, selectedAgentId])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Build system message from persona + selected agent
  const getSystemMessage = (): string => {
    const parts: string[] = []
    if (personaPrompt?.content?.trim()) {
      parts.push(personaPrompt.content.trim())
    }
    const agent = availableAgents.find(a => `${a.id}` === selectedAgentId)
    if (agent?.content?.trim()) {
      parts.push(agent.content.trim())
    }
    return parts.join('\n\n---\n\n')
  }

  const selectedAgent = availableAgents.find(a => `${a.id}` === selectedAgentId)

  const handleSend = async () => {
    const text = input.trim()
    if (!text || streaming || !selectedModel || !apiKey) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

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

    const systemMessage = getSystemMessage()
    const apiMessages = [
      ...(systemMessage ? [{ role: 'system' as const, content: systemMessage }] : []),
      ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
    ]

    // Add empty assistant message for streaming
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMsg])

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
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content,
                }
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response'
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = { ...last, content: `Error: ${errorMsg}` }
        } else {
          updated.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${errorMsg}`,
            timestamp: new Date(),
          })
        }
        return updated
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort()
    setMessages([])
    setStreaming(false)
  }

  const resetModel = () => {
    const defaultId = DEFAULT_MODELS[provider]
    const hasDefault = models.some(m => m.id === defaultId)
    setSelectedModel(hasDefault ? defaultId : models[0]?.id ?? '')
    setIsDefaultModel(true)
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    setIsDefaultModel(value === DEFAULT_MODELS[provider])
  }

  const isLoading = credLoading || promptsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!hasAnyKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/c/${clientId}/management/debug-ai-reps`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Debug Text AI Rep</h1>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No API Key Configured</AlertTitle>
          <AlertDescription>
            Configure an OpenRouter or OpenAI API key in Credentials to use the debugger.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/c/${clientId}/management/debug-ai-reps`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Debug Text AI Rep</h1>
          <p className="text-muted-foreground">
            Test your text AI agents using their prompts
          </p>
        </div>
      </div>

      {/* Config bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Agent selector */}
            <div className="space-y-1.5 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Agent</Label>
              <Select value={selectedAgentId} onValueChange={(v) => { setSelectedAgentId(v); clearChat() }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map(agent => (
                    <SelectItem key={agent.id} value={`${agent.id}`}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                        {agent.prompt_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider toggle */}
            {hasOpenRouter && hasOpenAI && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <div className="flex items-center gap-2 h-9">
                  <span className={`text-xs ${provider === 'openai' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    OpenAI
                  </span>
                  <Switch
                    checked={provider === 'openrouter'}
                    onCheckedChange={(checked) => setProvider(checked ? 'openrouter' : 'openai')}
                  />
                  <span className={`text-xs ${provider === 'openrouter' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    OpenRouter
                  </span>
                </div>
              </div>
            )}

            {!(hasOpenRouter && hasOpenAI) && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <div className="flex items-center h-9">
                  <span className="text-sm font-medium">{hasOpenRouter ? 'OpenRouter' : 'OpenAI'}</span>
                </div>
              </div>
            )}

            {/* Model selector */}
            <div className="space-y-1.5 min-w-[200px] flex-1">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={modelsLoading || models.length === 0}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder={modelsLoading ? 'Loading models...' : 'Select a model'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {models.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-sm">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isDefaultModel && (
                  <Button variant="ghost" size="sm" onClick={resetModel} title="Reset to default model" className="h-9 px-2">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active agent info */}
          {selectedAgent && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-3.5 w-3.5" />
              <span>
                Testing as <span className="font-medium text-foreground">{selectedAgent.prompt_name}</span>
                {personaPrompt?.content?.trim() && ' with Bot Persona'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* No agents warning */}
      {availableAgents.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Agents Configured</AlertTitle>
          <AlertDescription>
            Create text agent prompts in the Prompts section before testing.
          </AlertDescription>
        </Alert>
      )}

      {/* Chat interface */}
      <Card className="flex h-[550px] flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center py-20">
                <p className="text-sm text-muted-foreground text-center">
                  {selectedAgent
                    ? `Send a message to test your ${selectedAgent.prompt_name}`
                    : 'Select an agent above to start testing'}
                </p>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content || (streaming ? '...' : '')}</p>
                  <p
                    className={`mt-1 text-xs ${
                      msg.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <CardContent className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={!selectedAgentId || streaming || !selectedModel}
            />
            <Button
              onClick={handleSend}
              disabled={!selectedAgentId || !input.trim() || streaming || !selectedModel}
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              disabled={messages.length === 0 && !streaming}
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
