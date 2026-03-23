import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle, Database, Wifi, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
// Tabs replaced with custom buttons for reliable rendering
import { toast } from 'sonner'
import { useCredentials } from '@/hooks/useCredentials'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { createUserSupabase } from '@/lib/user-supabase'
import { supabase } from '@/lib/supabase'
import type { ClientData } from '@/contexts/UserSupabaseContext'

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  id?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative flex-1 w-full">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  )
}

interface FieldDef {
  key: keyof ClientData
  label: string
  type: 'text' | 'password'
  placeholder: string
}

interface TabSection {
  id: string
  label: string
  description: string
  fields: FieldDef[]
}

const SUPABASE_TAB_ID = 'supabase'

const TABS: TabSection[] = [
  {
    id: SUPABASE_TAB_ID,
    label: 'Supabase',
    description: "Client's Supabase project credentials (used by n8n and all data storage)",
    fields: [
      { key: 'supabase_url', label: 'Supabase Project URL', type: 'text', placeholder: 'https://your-project.supabase.co' },
      { key: 'supabase_service_key', label: 'Service Role Key', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIs...' },
    ],
  },
  {
    id: 'ai',
    label: 'AI APIs',
    description: 'API keys for language model and embedding services',
    fields: [
      { key: 'openrouter_api_key', label: 'OpenRouter API Key', type: 'password', placeholder: 'Enter OpenRouter API key' },
      { key: 'openai_api_key', label: 'OpenAI API Key', type: 'password', placeholder: 'Enter OpenAI API key' },
    ],
  },
  {
    id: 'ghl',
    label: 'GoHighLevel',
    description: 'GoHighLevel CRM integration credentials',
    fields: [
      { key: 'ghl_api_key', label: 'GHL API Key', type: 'password', placeholder: 'Enter GHL API key' },
      { key: 'ghl_location_id', label: 'GHL Location ID', type: 'text', placeholder: 'Enter location ID' },
      { key: 'ghl_calendar_id', label: 'GHL Calendar ID', type: 'text', placeholder: 'Enter calendar ID' },
      { key: 'ghl_assignee_id', label: 'GHL Assignee ID', type: 'text', placeholder: 'Enter assignee ID' },
    ],
  },
  {
    id: 'retell',
    label: 'Retell AI',
    description: 'Retell AI voice agent credentials and phone numbers',
    fields: [
      { key: 'retell_api_key', label: 'Retell API Key', type: 'password', placeholder: 'Enter Retell API key' },
      { key: 'retell_inbound_agent_id', label: 'Inbound Agent ID', type: 'text', placeholder: 'Enter inbound agent ID' },
      { key: 'retell_outbound_agent_id', label: 'Outbound Agent ID', type: 'text', placeholder: 'Enter outbound agent ID' },
      { key: 'retell_outbound_followup_agent_id', label: 'Outbound Followup Agent ID', type: 'text', placeholder: 'Enter followup agent ID' },
      { key: 'retell_agent_id_4', label: 'Agent ID 4', type: 'text', placeholder: 'Enter agent ID 4' },
      { key: 'retell_phone_1', label: 'Phone Number 1', type: 'text', placeholder: 'Enter phone number' },
      { key: 'retell_phone_2', label: 'Phone Number 2', type: 'text', placeholder: 'Enter phone number' },
      { key: 'retell_phone_3', label: 'Phone Number 3', type: 'text', placeholder: 'Enter phone number' },
    ],
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description: 'Webhook URLs for integrations and automation pipelines',
    fields: [
      { key: 'text_engine_webhook', label: 'Text Engine Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'text_engine_followup_webhook', label: 'Text Engine Followup Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'save_reply_webhook_url', label: 'Save Reply Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'transfer_to_human_webhook_url', label: 'Transfer to Human Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'user_details_webhook_url', label: 'User Details Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'update_pipeline_webhook_url', label: 'Update Pipeline Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'lead_score_webhook_url', label: 'Lead Score Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'outbound_caller_webhook_1_url', label: 'Outbound Caller Webhook 1', type: 'text', placeholder: 'https://...' },
      { key: 'outbound_caller_webhook_2_url', label: 'Outbound Caller Webhook 2', type: 'text', placeholder: 'https://...' },
      { key: 'outbound_caller_webhook_3_url', label: 'Outbound Caller Webhook 3', type: 'text', placeholder: 'https://...' },
      { key: 'database_reactivation_inbound_webhook_url', label: 'Database Reactivation Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'campaign_webhook_url', label: 'Campaign Webhook (per-lead)', type: 'text', placeholder: 'https://...' },
      { key: 'knowledge_base_add_webhook_url', label: 'Knowledge Base Add Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'knowledge_base_delete_webhook_url', label: 'Knowledge Base Delete Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'prompt_webhook_url', label: 'Prompt Sync Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'analytics_webhook_url', label: 'Analytics Webhook', type: 'text', placeholder: 'https://...' },
      { key: 'ai_chat_webhook_url', label: 'AI Chat Webhook', type: 'text', placeholder: 'https://...' },
    ],
  },
]

export default function Credentials() {
  const { credentials, loading, updateCredentials } = useCredentials()
  const { clientId, refetchConnection } = useClientSupabase()

  const [activeTab, setActiveTab] = useState(SUPABASE_TAB_ID)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [webhookTests, setWebhookTests] = useState<Record<string, 'testing' | 'success' | 'error'>>({})
  const [apiTests, setApiTests] = useState<Record<string, 'testing' | 'success' | 'error'>>({})

  const handleTestApi = async (tabId: string) => {
    setApiTests((prev) => ({ ...prev, [tabId]: 'testing' }))
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      if (tabId === 'ai') {
        // Test OpenRouter
        const orKey = formData.openrouter_api_key?.trim()
        const oaiKey = formData.openai_api_key?.trim()
        const results: string[] = []

        if (orKey) {
          const res = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${orKey}` },
            signal: controller.signal,
          })
          if (res.ok) {
            const data = await res.json()
            const count = Array.isArray(data?.data) ? data.data.length : 0
            results.push(`OpenRouter OK (${count} models)`)
          } else if (res.status === 401) {
            clearTimeout(timeout)
            setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
            toast.error('OpenRouter API key is invalid')
            return
          } else {
            results.push(`OpenRouter: ${res.status}`)
          }
        }

        if (oaiKey) {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${oaiKey}` },
            signal: controller.signal,
          })
          if (res.ok) {
            const data = await res.json()
            const count = Array.isArray(data?.data) ? data.data.length : 0
            results.push(`OpenAI OK (${count} models)`)
          } else if (res.status === 401) {
            clearTimeout(timeout)
            setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
            toast.error('OpenAI API key is invalid')
            return
          } else {
            results.push(`OpenAI: ${res.status}`)
          }
        }

        clearTimeout(timeout)
        if (results.length === 0) {
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error('Enter at least one API key to test')
          return
        }
        setApiTests((prev) => ({ ...prev, [tabId]: 'success' }))
        toast.success(results.join(' | '))

      } else if (tabId === 'ghl') {
        const ghlKey = formData.ghl_api_key?.trim()
        const locationId = formData.ghl_location_id?.trim()
        if (!ghlKey) {
          clearTimeout(timeout)
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error('Enter GHL API key first')
          return
        }
        const url = locationId
          ? `https://services.leadconnectorhq.com/locations/${locationId}`
          : 'https://services.leadconnectorhq.com/locations/search'
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${ghlKey}`,
            'Version': '2021-07-28',
          },
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          const name = data?.location?.name || data?.name || 'Connected'
          setApiTests((prev) => ({ ...prev, [tabId]: 'success' }))
          toast.success(`GHL connected: ${name}`)
        } else if (res.status === 401) {
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error('GHL API key is invalid or expired')
        } else {
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error(`GHL API returned ${res.status} ${res.statusText}`)
        }

      } else if (tabId === 'retell') {
        const retellKey = formData.retell_api_key?.trim()
        if (!retellKey) {
          clearTimeout(timeout)
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error('Enter Retell API key first')
          return
        }
        const res = await fetch('https://api.retellai.com/v2/agent', {
          headers: { 'Authorization': `Bearer ${retellKey}` },
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          const count = Array.isArray(data) ? data.length : 0
          setApiTests((prev) => ({ ...prev, [tabId]: 'success' }))
          toast.success(`Retell connected: ${count} agents found`)
        } else if (res.status === 401) {
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error('Retell API key is invalid')
        } else {
          setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
          toast.error(`Retell API returned ${res.status}`)
        }
      }
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError' ? 'Request timed out' : (err instanceof Error ? err.message : 'Network error')
      setApiTests((prev) => ({ ...prev, [tabId]: 'error' }))
      toast.error(`Connection test failed: ${msg}`)
    }
  }

  const handleTestWebhook = async (key: string) => {
    const url = formData[key]?.trim()
    if (!url) {
      toast.error('Enter a webhook URL first')
      return
    }
    setWebhookTests((prev) => ({ ...prev, [key]: 'testing' }))
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health_check', test: true, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
        setWebhookTests((prev) => ({ ...prev, [key]: 'success' }))
        toast.success(`Webhook responded OK (${res.status})`)
      } else {
        setWebhookTests((prev) => ({ ...prev, [key]: 'error' }))
        toast.error(`Webhook returned ${res.status} ${res.statusText}`)
      }
    } catch (err) {
      setWebhookTests((prev) => ({ ...prev, [key]: 'error' }))
      const msg = err instanceof Error && err.name === 'AbortError' ? 'Request timed out' : (err instanceof Error ? err.message : 'Network error')
      toast.error(`Webhook test failed: ${msg}`)
    }
  }

  useEffect(() => {
    if (credentials) {
      const initial: Record<string, string> = {}
      for (const tab of TABS) {
        for (const field of tab.fields) {
          initial[field.key] = (credentials[field.key] as string) ?? ''
        }
      }
      setFormData(initial)
    }
  }, [credentials])

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (key === 'supabase_url' || key === 'supabase_service_key') {
      setTestPassed(false)
    }
  }

  const handleTestConnection = async () => {
    const url = formData.supabase_url?.trim()
    const key = formData.supabase_service_key?.trim()
    if (!url || !key) {
      toast.error('Enter both the Supabase URL and Service Role Key')
      return
    }
    setTestingConnection(true)
    setTestPassed(false)
    try {
      const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url
      const client = createUserSupabase(normalizedUrl, key)
      const { error } = await client.from('_placeholder_ping').select('*').limit(1)
      if (error && !error.message.includes('does not exist') && !error.message.includes('schema cache') && !error.code?.startsWith('42')) {
        throw new Error(error.message)
      }
      setTestPassed(true)
      toast.success('Connection successful!')
    } catch (err) {
      toast.error(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSaveSupabase = async () => {
    if (!clientId) return
    setSavingTab(SUPABASE_TAB_ID)
    try {
      let url = formData.supabase_url?.trim() || ''
      if (url.endsWith('/')) url = url.slice(0, -1)
      const key = formData.supabase_service_key?.trim() || ''

      // Save directly to clients table (these aren't in FIELD_MAP)
      const { error } = await supabase
        .from('clients')
        .update({
          supabase_url: url,
          supabase_service_key: key,
          migration_status: url && key ? (credentials?.migration_status || 'pending') : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
      if (error) throw error
      await refetchConnection()
      toast.success('Supabase credentials saved')
    } catch {
      toast.error('Failed to save Supabase credentials')
    } finally {
      setSavingTab(null)
    }
  }

  const handleSaveTab = async (tab: TabSection) => {
    if (tab.id === SUPABASE_TAB_ID) {
      await handleSaveSupabase()
      return
    }
    setSavingTab(tab.id)
    try {
      const updates: Record<string, string> = {}
      for (const field of tab.fields) {
        updates[field.key] = formData[field.key] ?? ''
      }
      await updateCredentials(updates)
      toast.success(`${tab.label} credentials saved successfully`)
    } catch {
      toast.error(`Failed to save ${tab.label} credentials`)
    } finally {
      setSavingTab(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Credentials & Integrations</h1>
        <p className="text-muted-foreground">
          Manage API keys, service credentials, and webhook URLs for all integrations
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-border pb-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-card text-foreground border border-border border-b-0'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {TABS.filter(tab => tab.id === activeTab).map((tab) => {
          return (
            <div key={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{tab.label}</CardTitle>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tab.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <div className="flex w-full gap-2">
                        {field.type === 'password' ? (
                          <PasswordInput
                            id={field.key}
                            value={formData[field.key] ?? ''}
                            onChange={(v) => handleFieldChange(field.key, v)}
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            value={formData[field.key] ?? ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full"
                          />
                        )}
                        {tab.id === 'webhooks' && formData[field.key]?.trim() && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-9"
                            onClick={() => handleTestWebhook(field.key)}
                            disabled={webhookTests[field.key] === 'testing'}
                          >
                            {webhookTests[field.key] === 'testing' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : webhookTests[field.key] === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : webhookTests[field.key] === 'error' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Wifi className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tab.id === SUPABASE_TAB_ID && (
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !formData.supabase_url || !formData.supabase_service_key}
                      className="w-full"
                    >
                      {testingConnection ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : testPassed ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Connection Verified
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  )}
                  {(tab.id === 'ai' || tab.id === 'ghl' || tab.id === 'retell') && (
                    <Button
                      variant="outline"
                      onClick={() => handleTestApi(tab.id)}
                      disabled={apiTests[tab.id] === 'testing'}
                      className="w-full"
                    >
                      {apiTests[tab.id] === 'testing' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : apiTests[tab.id] === 'success' ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Connection Verified
                        </>
                      ) : apiTests[tab.id] === 'error' ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Test Failed — Retry
                        </>
                      ) : (
                        <>
                          <Wifi className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSaveTab(tab)}
                    disabled={savingTab === tab.id}
                  >
                    {savingTab === tab.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      `Save ${tab.label}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        })}
    </div>
  )
}
