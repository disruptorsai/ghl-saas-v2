import { Link } from 'react-router-dom'
import { ArrowLeft, Key, Shield, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'


const CREDENTIAL_GROUPS = [
  {
    title: 'Database',
    icon: Shield,
    credentials: [
      { name: 'Supabase URL', description: 'Supabase project URL', configKey: 'supabase_url', masked: 'https://*****.supabase.co' },
      { name: 'Supabase Service Key', description: 'Service role key for server-side operations', configKey: 'supabase_service_key', masked: 'eyJ***...***' },
    ],
  },
  {
    title: 'AI Services',
    icon: Key,
    credentials: [
      { name: 'OpenRouter API Key', description: 'API key for OpenRouter LLM access', configKey: 'openrouter_api_key', masked: 'sk-or-***...***' },
      { name: 'OpenAI API Key', description: 'API key for OpenAI embeddings', configKey: 'openai_api_key', masked: 'sk-***...***' },
    ],
  },
  {
    title: 'CRM',
    icon: Key,
    credentials: [
      { name: 'GHL API Key', description: 'GoHighLevel API key', configKey: 'ghl_api_key', masked: 'ghl-***...***' },
      { name: 'GHL Location ID', description: 'GoHighLevel location identifier', configKey: 'ghl_location_id', masked: '***...***' },
    ],
  },
  {
    title: 'Voice',
    icon: Key,
    credentials: [
      { name: 'Retell API Key', description: 'Retell AI voice agent API key', configKey: 'retell_api_key', masked: 'ret-***...***' },
    ],
  },
]

export default function ApiCredentials() {
  const handleTestConnection = (credentialName: string) => {
    toast.success(`Connection test for ${credentialName} initiated. This is a placeholder -- actual connection testing will be implemented in a future update.`)
  }

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
          <h1 className="text-2xl font-bold">API Credentials</h1>
          <p className="text-muted-foreground">
            View configured API keys and test integration connections
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Security Notice</p>
            <p className="text-xs text-muted-foreground">
              API keys are displayed in masked format for security. To update credentials, go to the
              client-level Credentials page from within a client context.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credential Groups */}
      {CREDENTIAL_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <group.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </div>
            <CardDescription>
              {group.title} service API credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.credentials.map((cred) => (
                <div
                  key={cred.configKey}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cred.name}</p>
                    <p className="text-xs text-muted-foreground">{cred.description}</p>
                    <code className="text-xs font-mono text-muted-foreground mt-1 block">
                      {cred.masked}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Configured
                    </Badge>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleTestConnection(cred.name)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
