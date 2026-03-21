import { useParams, useNavigate } from 'react-router-dom'
import { CredentialGate } from '@/components/CredentialGate'
import { CheckCircle, Circle, MessageSquare, Settings, FileText, BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientConfig } from '@/hooks/useClientConfig'

interface SetupStep {
  id: string
  name: string
  description: string
  link: string
}

const setupSteps: SetupStep[] = [
  {
    id: 'configure_openrouter_api_key',
    name: 'Configure OpenRouter API Key',
    description: 'Set up your OpenRouter API key for AI-powered text responses',
    link: 'configuration',
  },
  {
    id: 'configure_text_engine_webhook',
    name: 'Configure Text Engine Webhook',
    description: 'Connect the text engine webhook for processing messages',
    link: 'configuration',
  },
  {
    id: 'setup_bot_persona_prompt',
    name: 'Set Up Bot Persona Prompt',
    description: 'Define how your AI text agent presents itself',
    link: '../prompts/text',
  },
  {
    id: 'setup_text_agent_prompts',
    name: 'Set Up Text Agent Prompts',
    description: 'Configure the prompts that guide your text AI agent',
    link: '../prompts/text',
  },
  {
    id: 'configure_booking_agent',
    name: 'Configure Booking Agent',
    description: 'Set up the booking agent for appointment scheduling',
    link: '../prompts/text',
  },
]

export default function TextAiRep() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { config, loading } = useClientConfig(clientId ?? '')

  const completedSteps: string[] = Array.isArray(config?.setup_guide_completed_steps)
    ? (config.setup_guide_completed_steps as string[])
    : []

  const completedCount = setupSteps.filter(step => completedSteps.includes(step.id)).length
  const totalSteps = setupSteps.length
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Text AI Rep</h1>
        <p className="text-muted-foreground">
          Configure and manage your text-based AI representative
        </p>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Setup Progress</CardTitle>
              <CardDescription>
                {completedCount} of {totalSteps} steps completed
              </CardDescription>
            </div>
            <Badge variant={completedCount === totalSteps ? 'default' : 'secondary'}>
              {progressPercent}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Setup Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Checklist</CardTitle>
          <CardDescription>Complete these steps to fully configure your Text AI Rep</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {setupSteps.map(step => {
            const isCompleted = completedSteps.includes(step.id)
            return (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(step.link)}
                >
                  Configure
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('configuration')}
        >
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Configuration</p>
              <p className="text-xs text-muted-foreground">API keys and webhooks</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('templates')}
        >
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Templates</p>
              <p className="text-xs text-muted-foreground">Pre-built prompt templates</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('../what-to-do')}
        >
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Setup Guide</p>
              <p className="text-xs text-muted-foreground">Step-by-step instructions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">About Text AI Rep</p>
            <p className="text-sm text-muted-foreground">
              Your Text AI Rep handles text-based conversations with leads. It can
              re-engage cold leads, qualify prospects, book appointments, and provide
              customer support -- all powered by AI.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
