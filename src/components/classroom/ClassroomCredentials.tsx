import { useState, useEffect } from 'react'
import { Eye, EyeOff, CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FieldConfig {
  key: string
  label: string
  placeholder: string
  isSecret?: boolean
}

const MODULE_FIELDS: Record<string, FieldConfig[]> = {
  'api-setup': [
    { key: 'openrouter_api_key', label: 'OpenRouter API Key', placeholder: 'sk-or-...', isSecret: true },
    { key: 'openai_api_key', label: 'OpenAI API Key', placeholder: 'sk-...', isSecret: true },
  ],
  'voice-receptionist': [
    { key: 'retell_api_key', label: 'Retell AI API Key', placeholder: 'Enter Retell API key', isSecret: true },
    { key: 'retell_inbound_agent_id', label: 'Retell Inbound Agent ID', placeholder: 'agent_...' },
    { key: 'retell_phone_1', label: 'Retell Phone Number', placeholder: '+1...' },
  ],
  'db-reactivation': [
    { key: 'campaign_webhook_url', label: 'Campaign Webhook URL', placeholder: 'https://...' },
    { key: 'database_reactivation_inbound_webhook_url', label: 'DB Reactivation Inbound Webhook', placeholder: 'https://...' },
  ],
  'lead-followup': [
    { key: 'text_engine_webhook', label: 'Text Engine Webhook', placeholder: 'https://...' },
    { key: 'text_engine_followup_webhook', label: 'Text Engine Follow-up Webhook', placeholder: 'https://...' },
  ],
  'appointment-reminders': [
    { key: 'ghl_api_key', label: 'GoHighLevel API Key', placeholder: 'Enter GHL API key', isSecret: true },
    { key: 'ghl_calendar_id', label: 'GHL Calendar ID', placeholder: 'Enter Calendar ID' },
    { key: 'ghl_location_id', label: 'GHL Location ID', placeholder: 'Enter Location ID' },
  ],
  'quote-followup': [
    { key: 'save_reply_webhook_url', label: 'Save Reply Webhook URL', placeholder: 'https://...' },
    { key: 'update_pipeline_webhook_url', label: 'Update Pipeline Webhook URL', placeholder: 'https://...' },
  ],
  'review-request': [
    { key: 'lead_score_webhook_url', label: 'Lead Score Webhook URL', placeholder: 'https://...' },
  ],
  'website-chatbot': [
    { key: 'ai_chat_webhook_url', label: 'AI Chat Webhook URL', placeholder: 'https://...' },
  ],
}

interface Props {
  moduleId: string
}

export function ClassroomCredentials({ moduleId }: Props) {
  const { clientId, connection, refetchConnection } = useClientSupabase()
  const fields = MODULE_FIELDS[moduleId]
  const [values, setValues] = useState<Record<string, string>>({})
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!connection || !fields) return
    const initial: Record<string, string> = {}
    fields.forEach(f => {
      initial[f.key] = (connection as unknown as Record<string, unknown>)[f.key] as string || ''
    })
    setValues(initial)
  }, [connection, moduleId])

  if (!fields || fields.length === 0) return null
  if (!clientId) return null

  const toggleVisibility = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    const updates: Record<string, string> = {}
    fields.forEach(f => {
      updates[f.key] = values[f.key] || ''
    })

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)

    if (error) {
      toast.error('Failed to save credentials')
    } else {
      toast.success('Credentials saved')
      await refetchConnection()
    }
    setSaving(false)
  }

  const isFilled = (key: string) => {
    const val = (connection as unknown as Record<string, unknown>)?.[key] as string
    return !!val && val.trim().length > 0
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Required Credentials for this module
      </h3>
      <p className="text-xs text-muted-foreground">Module: {moduleId}</p>
      <div className="space-y-3">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.key} className="text-sm">
                {field.label}
              </Label>
              {isFilled(field.key) && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              )}
            </div>
            <div className="relative">
              <Input
                id={field.key}
                type={field.isSecret && !visibleFields[field.key] ? 'password' : 'text'}
                value={values[field.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full pr-10"
              />
              {field.isSecret && (
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {visibleFields[field.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Credentials'}
      </Button>
    </div>
  )
}
