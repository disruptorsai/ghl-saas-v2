import { useMemo } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import type { ClientData } from '@/contexts/UserSupabaseContext'

export type CredentialGroup = 'llm' | 'ghl' | 'retell' | 'webhooks'

interface GroupStatus {
  label: string
  configured: boolean
  missing: string[]
}

const has = (v: string | null | undefined): boolean => !!v && v.trim().length > 0

function checkGroup(creds: ClientData | null): Record<CredentialGroup, GroupStatus> {
  if (!creds) {
    return {
      llm: { label: 'LLM Credentials', configured: false, missing: ['OpenAI API Key', 'OpenRouter API Key'] },
      ghl: { label: 'GoHighLevel', configured: false, missing: ['GHL API Key', 'GHL Location ID'] },
      retell: { label: 'Retell AI', configured: false, missing: ['Retell API Key'] },
      webhooks: { label: 'Webhooks', configured: false, missing: ['Text Engine Webhook', 'Campaign Webhook'] },
    }
  }

  const llmMissing: string[] = []
  if (!has(creds.openai_api_key) && !has(creds.openrouter_api_key)) {
    llmMissing.push('OpenAI or OpenRouter API Key')
  }

  const ghlMissing: string[] = []
  if (!has(creds.ghl_api_key)) ghlMissing.push('GHL API Key')
  if (!has(creds.ghl_location_id)) ghlMissing.push('GHL Location ID')

  const retellMissing: string[] = []
  if (!has(creds.retell_api_key)) retellMissing.push('Retell API Key')

  const webhookMissing: string[] = []
  if (!has(creds.text_engine_webhook)) webhookMissing.push('Text Engine Webhook')
  if (!has(creds.campaign_webhook_url)) webhookMissing.push('Campaign Webhook')

  return {
    llm: { label: 'LLM Credentials', configured: llmMissing.length === 0, missing: llmMissing },
    ghl: { label: 'GoHighLevel', configured: ghlMissing.length === 0, missing: ghlMissing },
    retell: { label: 'Retell AI', configured: retellMissing.length === 0, missing: retellMissing },
    webhooks: { label: 'Webhooks', configured: webhookMissing.length === 0, missing: webhookMissing },
  }
}

/** Which credential groups each feature area requires. */
const FEATURE_REQUIREMENTS: Record<string, CredentialGroup[]> = {
  campaigns: ['ghl', 'webhooks'],
  'text-ai-rep': ['llm', 'ghl'],
  'text-ai-rep/configuration': ['llm', 'ghl'],
  'text-ai-rep/templates': ['llm', 'ghl'],
  'voice-ai-rep': ['llm', 'retell'],
  'voice-ai-rep/configuration': ['llm', 'retell'],
  'voice-ai-rep/templates': ['llm', 'retell'],
  'prompts/text': ['llm'],
  'prompts/voice': ['llm'],
  'knowledge-base': ['llm'],
  'deploy-ai-reps': ['llm', 'ghl'],
  'debug-ai-reps/text': ['llm', 'ghl'],
  'debug-ai-reps/voice': ['llm', 'retell'],
  'chatbot/dashboard': ['llm'],
  'chatbot/chat-with-ai': ['llm'],
  'voice-ai/dashboard': ['llm', 'retell'],
  'voice-ai/chat-with-ai': ['llm', 'retell'],
}

export function useCredentialStatus() {
  const { connection, connectionLoading } = useClientSupabase()

  const groups = useMemo(() => checkGroup(connection), [connection])

  const allConfigured = Object.values(groups).every((g) => g.configured)

  const missingForFeature = (featurePath: string): GroupStatus[] => {
    const required = FEATURE_REQUIREMENTS[featurePath]
    if (!required) return []
    return required.map((g) => groups[g]).filter((g) => !g.configured)
  }

  return { groups, allConfigured, missingForFeature, loading: connectionLoading }
}
