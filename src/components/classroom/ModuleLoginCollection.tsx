import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface LoginField {
  key: string
  label: string
  placeholder: string
  isSecret?: boolean
}

const MODULE_LOGINS: Record<string, { title: string; description: string; fields: LoginField[] }> = {
  'api-setup': {
    title: 'Software Logins',
    description: 'Save your GHL, OpenAI, and Retell credentials here for our team.',
    fields: [
      { key: 'ghl_email', label: 'GHL Login Email', placeholder: 'your@email.com' },
      { key: 'ghl_password', label: 'GHL Password', placeholder: 'Enter password', isSecret: true },
      { key: 'openai_email', label: 'OpenAI Login Email', placeholder: 'your@email.com' },
      { key: 'openai_password', label: 'OpenAI Password', placeholder: 'Enter password', isSecret: true },
      { key: 'retell_email', label: 'Retell.ai Login Email', placeholder: 'your@email.com' },
      { key: 'retell_password', label: 'Retell.ai Password', placeholder: 'Enter password', isSecret: true },
    ],
  },
  'twilio-setup': {
    title: 'Twilio Logins',
    description: 'Your Twilio account credentials for phone and SMS setup.',
    fields: [
      { key: 'twilio_email', label: 'Twilio Login Email', placeholder: 'your@email.com' },
      { key: 'twilio_password', label: 'Twilio Password', placeholder: 'Enter password', isSecret: true },
      { key: 'twilio_account_sid', label: 'Account SID', placeholder: 'AC...' },
      { key: 'twilio_auth_token', label: 'Auth Token', placeholder: 'Enter auth token', isSecret: true },
    ],
  },
  'a2p-registration': {
    title: 'Business Registration Details',
    description: 'Your business details for A2P 10DLC registration.',
    fields: [
      { key: 'a2p_legal_name', label: 'Legal Business Name', placeholder: 'Exactly as registered with IRS' },
      { key: 'a2p_ein', label: 'EIN (Tax ID)', placeholder: 'XX-XXXXXXX', isSecret: true },
      { key: 'a2p_address', label: 'Business Address', placeholder: '123 Main St, City, State ZIP' },
      { key: 'a2p_website', label: 'Business Website', placeholder: 'https://yourbusiness.com' },
      { key: 'a2p_industry', label: 'Industry', placeholder: 'e.g., Home Services, Healthcare' },
      { key: 'a2p_contact_email', label: 'Contact Email', placeholder: 'your@business.com' },
      { key: 'a2p_contact_phone', label: 'Contact Phone', placeholder: '(555) 123-4567' },
    ],
  },
  'knowledge-base': {
    title: 'Business Knowledge Logins',
    description: 'Logins for any systems where your business info lives.',
    fields: [
      { key: 'kb_website_cms', label: 'Website CMS Login URL', placeholder: 'https://yourdomain.com/wp-admin' },
      { key: 'kb_cms_user', label: 'CMS Username', placeholder: 'admin' },
      { key: 'kb_cms_pass', label: 'CMS Password', placeholder: 'Enter password', isSecret: true },
      { key: 'kb_google_business', label: 'Google Business Email', placeholder: 'your@gmail.com' },
    ],
  },
}

interface ModuleLoginCollectionProps {
  moduleId: string
  stepId: string
}

export function ModuleLoginCollection({ moduleId, stepId }: ModuleLoginCollectionProps) {
  // Only show on the first step of each module
  const isFirstStep = stepId.endsWith('-1') || stepId.endsWith('-setup-1')
  const section = MODULE_LOGINS[moduleId]
  if (!section || !isFirstStep) return null

  const storageKey = `module-logins-${moduleId}`
  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  })
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [values])

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(values))
    setSaved(true)
    toast.success('Logins saved securely!')
  }

  const filledCount = section.fields.filter(f => values[f.key]?.trim()).length

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2">
          <KeyRound className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filledCount} of {section.fields.length} provided
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {section.fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              {f.label}
              {values[f.key]?.trim() && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </Label>
            <div className="relative">
              <Input
                type={f.isSecret && !visible[f.key] ? 'password' : 'text'}
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="pr-8"
              />
              {f.isSecret && (
                <button
                  type="button"
                  onClick={() => setVisible({ ...visible, [f.key]: !visible[f.key] })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {visible[f.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} size="sm" variant="outline" className="gap-2">
        {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Saved!' : 'Save Logins'}
      </Button>
    </div>
  )
}
