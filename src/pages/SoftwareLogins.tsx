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

interface PlatformConfig {
  name: string
  fields: FieldConfig[]
}

const PLATFORMS: PlatformConfig[] = [
  {
    name: 'n8n',
    fields: [
      { key: 'n8n_email', label: 'Email', placeholder: 'Enter n8n email' },
      { key: 'n8n_password', label: 'Password', placeholder: 'Enter n8n password', isSecret: true },
      { key: 'n8n_instance_url', label: 'Instance URL', placeholder: 'https://your-instance.n8n.cloud' },
    ],
  },
  {
    name: 'Supabase',
    fields: [
      { key: 'supabase_email', label: 'Email', placeholder: 'Enter Supabase email' },
      { key: 'supabase_password', label: 'Password', placeholder: 'Enter Supabase password', isSecret: true },
      { key: 'supabase_project_url', label: 'Project URL', placeholder: 'https://xxx.supabase.co' },
    ],
  },
  {
    name: 'GoHighLevel',
    fields: [
      { key: 'ghl_email', label: 'Email', placeholder: 'Enter GHL email' },
      { key: 'ghl_password', label: 'Password', placeholder: 'Enter GHL password', isSecret: true },
    ],
  },
  {
    name: 'Twilio',
    fields: [
      { key: 'twilio_email', label: 'Email', placeholder: 'Enter Twilio email' },
      { key: 'twilio_password', label: 'Password', placeholder: 'Enter Twilio password', isSecret: true },
      { key: 'twilio_account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'twilio_auth_token', label: 'Auth Token', placeholder: 'Enter Twilio auth token', isSecret: true },
    ],
  },
]

const ALL_FIELDS = PLATFORMS.flatMap(p => p.fields)

export default function SoftwareLogins() {
  const { clientId, connection, refetchConnection } = useClientSupabase()
  const [values, setValues] = useState<Record<string, string>>({})
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!connection) return
    const initial: Record<string, string> = {}
    ALL_FIELDS.forEach(f => {
      initial[f.key] = (connection as unknown as Record<string, unknown>)[f.key] as string || ''
    })
    setValues(initial)
  }, [connection])

  if (!clientId) return null

  const toggleVisibility = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    const updates: Record<string, string> = {}
    ALL_FIELDS.forEach(f => {
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
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Software Logins</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Store your login credentials for each platform used in the sales infrastructure.
        </p>
      </div>

      {PLATFORMS.map(platform => (
        <div key={platform.name} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {platform.name}
          </h3>
          <div className="space-y-3">
            {platform.fields.map(field => (
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
        </div>
      ))}

      <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Credentials'}
      </Button>
    </div>
  )
}
