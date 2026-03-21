import { useState, useEffect } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import {
  CheckCircle,
  XCircle,
  Rocket,
  Download,
  MessageSquare,
  Phone,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useCredentials } from '@/hooks/useCredentials'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

interface CheckItem {
  label: string
  passed: boolean
}

type DeployStatus = 'idle' | 'deploying' | 'deployed' | 'failed'

function DeploymentCard({
  title,
  icon: Icon,
  checks,
  onDeploy,
  deployStatus,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  checks: CheckItem[]
  onDeploy: () => void
  deployStatus: DeployStatus
}) {
  const passed = checks.filter(c => c.passed).length
  const total = checks.length
  const allPassed = passed === total
  const percent = total > 0 ? Math.round((passed / total) * 100) : 0

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {deployStatus === 'deployed' && (
            <Badge className="bg-green-100 text-green-700">Deployed</Badge>
          )}
          {deployStatus === 'failed' && (
            <Badge variant="destructive">Failed</Badge>
          )}
        </div>
        <CardDescription>
          {passed} of {total} checks passed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Readiness</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${
                allPassed ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <ul className="space-y-3">
          {checks.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              {item.passed ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              )}
              <span className="text-sm">{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Deploy button */}
        <Button
          className="w-full"
          disabled={!allPassed || deployStatus === 'deploying'}
          onClick={onDeploy}
        >
          {deployStatus === 'deploying' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : deployStatus === 'deployed' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Re-deploy
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

const workflowFiles = [
  {
    name: 'Database Reactivation',
    file: 'Launch_Campaign.json',
    path: '/workflows/database-reactivation/Launch_Campaign.json',
  },
  {
    name: 'Knowledge Base Automation',
    file: 'Update_Knowledgebase.json',
    path: '/workflows/knowledgebase-automation/Update_Knowledgebase.json',
  },
  {
    name: 'Text Engine',
    file: 'Text_Engine.json',
    path: '/workflows/text-engine/Text_Engine.json',
  },
  {
    name: 'Appointment Booking',
    file: 'Appointment_Booking_Functions.json',
    path: '/workflows/voice-sales-rep/Appointment_Booking_Functions.json',
  },
  {
    name: 'Get Lead Details',
    file: 'Get_Lead_Details.json',
    path: '/workflows/voice-sales-rep/Get_Lead_Details.json',
  },
  {
    name: 'Make Outbound Call',
    file: 'Make_Outbound_Call.json',
    path: '/workflows/voice-sales-rep/Make_Outbound_Call.json',
  },
]

export default function DeployAiReps() {
  const { clientDb } = useClientSupabase()
  const { credentials, loading } = useCredentials()
  const [promptCategories, setPromptCategories] = useState<string[]>([])
  const [loadingPrompts, setLoadingPrompts] = useState(true)
  const [textDeployStatus, setTextDeployStatus] = useState<DeployStatus>('idle')
  const [voiceDeployStatus, setVoiceDeployStatus] = useState<DeployStatus>('idle')

  useEffect(() => {
    if (!clientDb) return
    const fetchPrompts = async () => {
      setLoadingPrompts(true)
      const { data } = await clientDb
        .from('prompts')
        .select('category')
      if (data) {
        const categories = [...new Set(data.map(p => p.category as string))]
        setPromptCategories(categories)
      }
      setLoadingPrompts(false)
    }
    fetchPrompts()
  }, [clientDb])

  const isLoading = loading || loadingPrompts

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="h-96 flex-1" />
          <Skeleton className="h-96 flex-1" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const hasCred = (key: keyof NonNullable<typeof credentials>) => {
    const val = credentials?.[key]
    return typeof val === 'string' && val.trim().length > 0
  }
  const hasCategory = (cat: string) => promptCategories.includes(cat)

  const textChecks: CheckItem[] = [
    { label: 'OpenRouter API Key configured', passed: hasCred('openrouter_api_key') },
    { label: 'Text Engine Webhook configured', passed: hasCred('text_engine_webhook') },
    { label: 'Bot Persona prompt created', passed: hasCategory('bot_persona') },
    { label: 'Text Agent prompts created', passed: hasCategory('text_agent') },
    { label: 'Booking Agent configured', passed: hasCategory('booking_agent') },
  ]

  const voiceChecks: CheckItem[] = [
    { label: 'Retell API Key configured', passed: hasCred('retell_api_key') },
    { label: 'Inbound Agent ID set', passed: hasCred('retell_inbound_agent_id') },
    { label: 'Outbound Agent ID set', passed: hasCred('retell_outbound_agent_id') },
    { label: 'Phone Numbers configured', passed: hasCred('retell_phone_1') },
    {
      label: 'GHL Integration configured',
      passed: hasCred('ghl_api_key') && hasCred('ghl_location_id'),
    },
    { label: 'Voice Persona prompt created', passed: hasCategory('voice_persona') },
  ]

  const handleDeploy = async (type: 'Text AI' | 'Voice AI') => {
    const setStatus = type === 'Text AI' ? setTextDeployStatus : setVoiceDeployStatus
    setStatus('deploying')

    const webhookUrl = type === 'Text AI'
      ? credentials?.text_engine_webhook
      : credentials?.outbound_caller_webhook_1_url

    if (!webhookUrl) {
      toast.error(`No ${type} webhook URL configured`)
      setStatus('failed')
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'health_check',
          client_id: clientDb ? 'connected' : undefined,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
        setStatus('deployed')
        toast.success(`${type} deployment verified — webhook is responsive`)
      } else {
        setStatus('failed')
        toast.error(`${type} deployment failed — webhook returned ${res.status}`)
      }
    } catch (err) {
      setStatus('failed')
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Webhook timed out'
        : (err instanceof Error ? err.message : 'Network error')
      toast.error(`${type} deployment failed: ${msg}`)
    }
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Deploy AI Reps</h1>
        <p className="text-muted-foreground">
          Check your setup progress before deploying
        </p>
      </div>

      {/* Two-column deployment cards */}
      <div className="flex flex-col gap-6 md:flex-row">
        <DeploymentCard
          title="Text AI Rep"
          icon={MessageSquare}
          checks={textChecks}
          onDeploy={() => handleDeploy('Text AI')}
          deployStatus={textDeployStatus}
        />
        <DeploymentCard
          title="Voice AI Rep"
          icon={Phone}
          checks={voiceChecks}
          onDeploy={() => handleDeploy('Voice AI')}
          deployStatus={voiceDeployStatus}
        />
      </div>

      {/* Workflow Import Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">GHL Workflow Imports</CardTitle>
          </div>
          <CardDescription>
            Download workflow JSON files to import into GoHighLevel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {workflowFiles.map((wf) => (
              <div
                key={wf.path}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{wf.name}</p>
                  <p className="text-xs text-muted-foreground">{wf.file}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={wf.path} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
