import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CredentialGate } from '@/components/CredentialGate'
import { FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Template {
  name: string
  description: string
  category: 'bot_persona' | 'text_agent' | 'booking_agent'
}

const templates: Template[] = [
  {
    name: 'Database Reactivation Agent',
    description: 'Re-engage cold leads from your database with personalized outreach',
    category: 'text_agent',
  },
  {
    name: 'Appointment Booking Agent',
    description: 'Qualify leads and book appointments into your calendar',
    category: 'booking_agent',
  },
  {
    name: 'Follow-Up Agent',
    description: 'Automated follow-up sequences for unresponsive leads',
    category: 'text_agent',
  },
  {
    name: 'Customer Support Bot',
    description: 'Handle common support queries and escalate when needed',
    category: 'bot_persona',
  },
]

const categoryLabels: Record<string, string> = {
  bot_persona: 'Bot Persona',
  text_agent: 'Text Agent',
  booking_agent: 'Booking Agent',
}

const categoryColors: Record<string, string> = {
  bot_persona: 'bg-blue-100 text-blue-700',
  text_agent: 'bg-green-100 text-green-700',
  booking_agent: 'bg-purple-100 text-purple-700',
}

export default function TextAiRepTemplates() {
  const { clientId } = useParams<{ clientId: string }>()
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)

  const handleUseTemplate = async (template: Template) => {
    if (!clientId) return
    setLoadingTemplate(template.name)
    try {
      const { error } = await supabase.from('prompts').insert({
        client_id: clientId,
        name: template.name,
        description: template.description,
        category: template.category,
        content: '',
        is_active: true,
      })
      if (error) throw error
      toast.success(`Template "${template.name}" added to your prompts`)
    } catch {
      toast.error(`Failed to add template "${template.name}"`)
    } finally {
      setLoadingTemplate(null)
    }
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Text AI Rep Templates</h1>
        <p className="text-muted-foreground">
          Choose from pre-built templates to quickly set up your text AI agent
        </p>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">How Templates Work</p>
            <p className="text-sm text-muted-foreground">
              Templates create a new prompt entry with pre-configured settings. After
              adding a template, go to the Prompts section to customize the content
              for your specific use case.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map(template => (
          <Card key={template.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className={categoryColors[template.category]}
                >
                  {categoryLabels[template.category]}
                </Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleUseTemplate(template)}
                disabled={loadingTemplate === template.name}
                className="w-full"
              >
                {loadingTemplate === template.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Use Template'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </CredentialGate>
  )
}
