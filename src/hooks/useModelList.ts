import { useState, useEffect } from 'react'

export type Provider = 'openrouter' | 'openai'

export interface ModelOption {
  id: string
  name: string
}

/** Curated OpenAI chat models — no need to fetch the full list */
const OPENAI_MODELS: ModelOption[] = [
  { id: 'gpt-5', name: 'GPT-5' },
  { id: 'gpt-4.1', name: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'o3', name: 'o3' },
  { id: 'o3-mini', name: 'o3 Mini' },
  { id: 'o4-mini', name: 'o4 Mini' },
  { id: 'o1', name: 'o1' },
  { id: 'o1-mini', name: 'o1 Mini' },
]

/** Only show well-known chat providers on OpenRouter */
const OPENROUTER_PREFIXES = [
  'openai/',
  'anthropic/',
  'google/',
  'meta-llama/',
  'mistralai/',
  'deepseek/',
  'cohere/',
]

export function useModelList(provider: Provider, apiKey: string | null | undefined) {
  const [models, setModels] = useState<ModelOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!apiKey) {
      setModels([])
      return
    }

    // OpenAI uses a curated static list
    if (provider === 'openai') {
      setModels(OPENAI_MODELS)
      return
    }

    // OpenRouter — fetch but filter to known providers
    let cancelled = false
    const fetchModels = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (!res.ok) throw new Error('Failed to fetch models')
        const data = await res.json()
        if (cancelled) return
        const list: ModelOption[] = (data.data ?? [])
          .filter((m: { id: string }) =>
            OPENROUTER_PREFIXES.some((p) => m.id.startsWith(p))
          )
          .map((m: { id: string; name?: string }) => ({
            id: m.id,
            name: m.name || m.id,
          }))
          .sort((a: ModelOption, b: ModelOption) => a.name.localeCompare(b.name))
        setModels(list)
      } catch (err) {
        console.error(`[useModelList] Failed to fetch OpenRouter models:`, err)
        if (!cancelled) setModels([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchModels()
    return () => { cancelled = true }
  }, [provider, apiKey])

  return { models, loading }
}
