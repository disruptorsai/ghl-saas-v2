import { Link } from 'react-router-dom'
import { Settings, Key, Download, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

interface ApiCard {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const API_CARDS: ApiCard[] = [
  {
    title: 'API Configuration',
    description: 'View and manage general API settings, endpoint configuration, and webhook URL patterns',
    href: '/api/configuration',
    icon: Settings,
  },
  {
    title: 'API Credentials',
    description: 'View all configured API keys (masked) and test integration connections',
    href: '/api/credentials',
    icon: Key,
  },
  {
    title: 'Workflow Imports',
    description: 'Download and import GoHighLevel workflow JSON files for automation setup',
    href: '/api/workflow-imports',
    icon: Download,
  },
]

const INTEGRATION_STATUS = [
  { name: 'Supabase', description: 'Database & Storage', status: 'configured' as const },
  { name: 'GoHighLevel', description: 'CRM & Pipeline', status: 'configured' as const },
  { name: 'OpenRouter', description: 'LLM API', status: 'optional' as const },
  { name: 'OpenAI', description: 'Embeddings', status: 'optional' as const },
  { name: 'Retell AI', description: 'Voice Agents', status: 'optional' as const },
  { name: 'n8n', description: 'Workflow Automation', status: 'configured' as const },
]

export default function ApiOverview() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">API & Integrations</h1>
        <p className="text-muted-foreground">
          Manage API configuration, credentials, and workflow imports for your integrations
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {API_CARDS.map((card) => (
          <Link key={card.href} to={card.href} className="block">
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Open
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Status</CardTitle>
          <CardDescription>
            Overview of all connected services and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {INTEGRATION_STATUS.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {integration.status === 'configured' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Badge variant={integration.status === 'configured' ? 'default' : 'secondary'}>
                  {integration.status === 'configured' ? 'Core' : 'Optional'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
