import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, PhoneIncoming, PhoneOutgoing, Clock, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useWebinarSetup } from '@/hooks/useWebinarSetup'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

interface AgentSection {
  key: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  fields: { name: string; label: string; placeholder: string }[]
}

const AGENT_SECTIONS: AgentSection[] = [
  {
    key: 'inbound_agent',
    title: 'Webinar Inbound Agent',
    description: 'Handles incoming calls and registrations for the webinar',
    icon: PhoneIncoming,
    fields: [
      { name: 'agent_id', label: 'Agent ID', placeholder: 'Enter inbound agent ID' },
      { name: 'webhook_url', label: 'Webhook URL', placeholder: 'https://...' },
    ],
  },
  {
    key: 'outbound_agent',
    title: 'Webinar Outbound Agent',
    description: 'Manages outbound calls to invite prospects to the webinar',
    icon: PhoneOutgoing,
    fields: [
      { name: 'agent_id', label: 'Agent ID', placeholder: 'Enter outbound agent ID' },
      { name: 'webhook_url', label: 'Webhook URL', placeholder: 'https://...' },
    ],
  },
  {
    key: 'followup_agent',
    title: 'Webinar 2hr Followup Agent',
    description: 'Follows up with attendees 2 hours after the webinar',
    icon: Clock,
    fields: [
      { name: 'agent_id', label: 'Agent ID', placeholder: 'Enter followup agent ID' },
      { name: 'webhook_url', label: 'Webhook URL', placeholder: 'https://...' },
    ],
  },
  {
    key: 'nurturing_agent',
    title: 'Webinar Nurturing Agent',
    description: 'Nurtures leads who registered but did not attend',
    icon: Heart,
    fields: [
      { name: 'agent_id', label: 'Agent ID', placeholder: 'Enter nurturing agent ID' },
      { name: 'webhook_url', label: 'Webhook URL', placeholder: 'https://...' },
    ],
  },
]

export default function WebinarCredentials() {
  const { clientId } = useClientSupabase()
  const { setup, loading, upsertSetup } = useWebinarSetup()

  const [agentData, setAgentData] = useState<Record<string, Record<string, string>>>({})
  const [savingSection, setSavingSection] = useState<string | null>(null)

  useEffect(() => {
    if (setup?.metrics) {
      const initial: Record<string, Record<string, string>> = {}
      for (const section of AGENT_SECTIONS) {
        const stored = (setup.metrics[section.key] ?? {}) as Record<string, string>
        initial[section.key] = {}
        for (const field of section.fields) {
          initial[section.key][field.name] = stored[field.name] ?? ''
        }
      }
      setAgentData(initial)
    } else {
      const initial: Record<string, Record<string, string>> = {}
      for (const section of AGENT_SECTIONS) {
        initial[section.key] = {}
        for (const field of section.fields) {
          initial[section.key][field.name] = ''
        }
      }
      setAgentData(initial)
    }
  }, [setup])

  const handleFieldChange = (sectionKey: string, fieldName: string, value: string) => {
    setAgentData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldName]: value,
      },
    }))
  }

  const handleSaveSection = async (sectionKey: string) => {
    setSavingSection(sectionKey)
    try {
      const currentMetrics = setup?.metrics ?? {}
      await upsertSetup({
        metrics: {
          ...currentMetrics,
          [sectionKey]: agentData[sectionKey],
        },
      })
      toast.success('Agent credentials saved successfully')
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setSavingSection(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/client/${clientId}/webinar-setup`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Webinar Credentials</h1>
          <p className="text-muted-foreground">
            Configure agent credentials for webinar automation
          </p>
        </div>
      </div>

      {/* Agent sections */}
      {AGENT_SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <section.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </div>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`${section.key}-${field.name}`}>
                  {field.label}
                </Label>
                <Input
                  id={`${section.key}-${field.name}`}
                  value={agentData[section.key]?.[field.name] ?? ''}
                  onChange={(e) =>
                    handleFieldChange(section.key, field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <Button
              onClick={() => handleSaveSection(section.key)}
              disabled={savingSection === section.key}
              size="sm"
            >
              {savingSection === section.key ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
