import { Link } from 'react-router-dom'
import { ArrowLeft, Globe, Webhook, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ENDPOINT_GROUPS = [
  {
    title: 'Text Engine',
    icon: Server,
    endpoints: [
      { method: 'POST', path: '/text-engine', description: 'Main text engine processing endpoint' },
      { method: 'POST', path: '/text-engine/followup', description: 'Text engine followup processing' },
      { method: 'POST', path: '/text-engine/save-reply', description: 'Save AI reply to conversation' },
    ],
  },
  {
    title: 'Voice Engine',
    icon: Server,
    endpoints: [
      { method: 'POST', path: '/outbound-caller/1', description: 'Outbound caller webhook 1' },
      { method: 'POST', path: '/outbound-caller/2', description: 'Outbound caller webhook 2' },
      { method: 'POST', path: '/outbound-caller/3', description: 'Outbound caller webhook 3' },
    ],
  },
  {
    title: 'Pipeline & Leads',
    icon: Globe,
    endpoints: [
      { method: 'POST', path: '/transfer-to-human', description: 'Transfer conversation to human agent' },
      { method: 'POST', path: '/user-details', description: 'Retrieve user/lead details' },
      { method: 'POST', path: '/update-pipeline', description: 'Update pipeline stage' },
      { method: 'POST', path: '/lead-score', description: 'Calculate and update lead score' },
    ],
  },
  {
    title: 'Knowledge Base',
    icon: Webhook,
    endpoints: [
      { method: 'POST', path: '/knowledge-base/add', description: 'Add entry to knowledge base' },
      { method: 'DELETE', path: '/knowledge-base/delete', description: 'Remove entry from knowledge base' },
    ],
  },
  {
    title: 'Analytics & Chat',
    icon: Webhook,
    endpoints: [
      { method: 'POST', path: '/analytics', description: 'Analytics data webhook' },
      { method: 'POST', path: '/chat-analytics', description: 'Chat analytics data webhook' },
      { method: 'POST', path: '/ai-chat', description: 'AI chat processing webhook' },
      { method: 'POST', path: '/prompt', description: 'Prompt processing webhook' },
    ],
  },
  {
    title: 'Campaigns',
    icon: Webhook,
    endpoints: [
      { method: 'POST', path: '/campaign', description: 'Campaign execution webhook' },
      { method: 'POST', path: '/database-reactivation/inbound', description: 'Database reactivation inbound webhook' },
    ],
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function ApiConfig() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/api">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">API Configuration</h1>
          <p className="text-muted-foreground">
            Endpoint configuration and webhook URL patterns used by the system
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
          <CardDescription>
            Core API configuration for the Disruptors Infra platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">API Version</p>
              <p className="text-xs text-muted-foreground">Current API version</p>
            </div>
            <Badge>v1.0</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Webhook Protocol</p>
              <p className="text-xs text-muted-foreground">All webhooks use HTTPS POST</p>
            </div>
            <Badge variant="secondary">HTTPS</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-xs text-muted-foreground">API key based authentication via headers</p>
            </div>
            <Badge variant="secondary">API Key</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Groups */}
      {ENDPOINT_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <group.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </div>
            <CardDescription>
              Webhook endpoints for {group.title.toLowerCase()} integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.endpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Badge
                    className={`${METHOD_COLORS[endpoint.method] ?? 'bg-gray-100 text-gray-700'} font-mono text-xs px-2 py-0.5`}
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                  <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
                    {endpoint.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Webhook URL Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webhook URL Pattern</CardTitle>
          <CardDescription>
            How webhook URLs are constructed for each client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted p-4">
            <code className="text-sm font-mono block">
              {'https://{n8n-host}/webhook/{webhook-id}'}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Each client has unique webhook URLs configured in their credentials. The webhook IDs
              are generated by n8n when workflows are imported and activated.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-1">Payload Format</p>
            <code className="text-xs font-mono block whitespace-pre">{`{
  "client_id": "uuid",
  "data": { ... },
  "timestamp": "ISO-8601"
}`}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
