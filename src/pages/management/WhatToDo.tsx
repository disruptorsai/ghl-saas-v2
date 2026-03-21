import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Key,
  MessageSquare,
  Phone,
  FileText,
  BookOpen,
  Rocket,
  Megaphone,
  BarChart3,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClientConfig } from '@/hooks/useClientConfig'
import { toast } from 'sonner'

interface SetupStep {
  id: string
  title: string
  description: string
  link: string
  icon: React.ReactNode
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: 'api-keys',
    title: 'Set Up Your API Keys',
    description: 'Configure OpenRouter, OpenAI, and other API keys',
    link: 'credentials',
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: 'text-ai',
    title: 'Configure Text AI Rep',
    description: 'Set up webhooks and prompts for text-based AI',
    link: 'text-ai-rep',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'voice-ai',
    title: 'Configure Voice AI Rep',
    description: 'Set up Retell AI, phone numbers, and GHL',
    link: 'voice-ai-rep',
    icon: <Phone className="h-5 w-5" />,
  },
  {
    id: 'prompts',
    title: 'Create Your Prompts',
    description: 'Set up bot persona, text agent, and voice agent prompts',
    link: 'prompts',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'knowledge-base',
    title: 'Build Your Knowledge Base',
    description: 'Add knowledge base entries for AI context',
    link: 'knowledge-base',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: 'deploy',
    title: 'Deploy Your AI Reps',
    description: 'Check deployment readiness',
    link: 'deploy-ai-reps',
    icon: <Rocket className="h-5 w-5" />,
  },
  {
    id: 'campaign',
    title: 'Create Your First Campaign',
    description: 'Set up a database reactivation campaign',
    link: 'campaigns',
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    id: 'analytics',
    title: 'Monitor Analytics',
    description: 'Track your AI rep performance',
    link: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
]

export default function WhatToDo() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { config, loading, updateConfig } = useClientConfig(clientId ?? '')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (config) {
      const steps = (config.setup_guide_completed_steps as string[] | null) ?? []
      setCompletedSteps(steps)
      const ack = (config.what_to_do_acknowledged as boolean | null) ?? false
      setAcknowledged(ack)
      setCollapsed(ack)
    }
  }, [config])

  const progress = SETUP_STEPS.length > 0
    ? Math.round((completedSteps.length / SETUP_STEPS.length) * 100)
    : 0

  const toggleStep = async (stepId: string) => {
    const isCompleted = completedSteps.includes(stepId)
    const next = isCompleted
      ? completedSteps.filter((s) => s !== stepId)
      : [...completedSteps, stepId]

    setCompletedSteps(next)

    try {
      await updateConfig({ setup_guide_completed_steps: next })
      toast.success(isCompleted ? 'Step unmarked' : 'Step marked as complete')
    } catch {
      setCompletedSteps(completedSteps)
      toast.error('Failed to update step')
    }
  }

  const handleAcknowledge = async () => {
    try {
      await updateConfig({ what_to_do_acknowledged: true })
      setAcknowledged(true)
      setCollapsed(true)
      toast.success("Guide acknowledged. You can expand it anytime.")
    } catch {
      toast.error('Failed to update acknowledgment')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">What to Do</h1>
          <p className="text-muted-foreground">Follow these steps to set up your AI reps</p>
        </div>
        {acknowledged && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <>
                <Eye className="h-4 w-4" />
                Show Guide
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Hide Guide
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Setup Progress</span>
          <span className="font-medium">{completedSteps.length} of {SETUP_STEPS.length} steps completed</span>
        </div>
        <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-medium text-right">{progress}%</p>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="space-y-3">
          {SETUP_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)

            return (
              <Card
                key={step.id}
                className={`transition-colors ${isCompleted ? 'bg-muted/50 border-primary/20' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Step Number + Check */}
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="flex-shrink-0 focus:outline-none"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      ) : (
                        <div className="relative">
                          <Circle className="h-8 w-8 text-muted-foreground/40" />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Icon */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isCompleted ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStep(step.id)}
                      >
                        {isCompleted ? 'Undo' : 'Mark Complete'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/client/${clientId}/${step.link}`)}
                      >
                        Go
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Acknowledge Button */}
      {!acknowledged && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All set?</CardTitle>
            <CardDescription>
              Once you've reviewed the setup guide, you can dismiss it. You can always come back to this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAcknowledge} variant="outline">
              I've read this, don't show again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
