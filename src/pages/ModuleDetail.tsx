import { useState } from 'react'
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { modules } from '@/data/modules'
import { StepSidebar } from '@/components/classroom/StepSidebar'
import { VideoPlayer } from '@/components/classroom/VideoPlayer'
import { StepInstructions } from '@/components/classroom/StepInstructions'
import { MarkComplete } from '@/components/classroom/MarkComplete'
import { ClassroomCredentials } from '@/components/classroom/ClassroomCredentials'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

export default function ModuleDetail() {
  const { clientId, moduleId, stepId } = useParams<{
    clientId: string
    moduleId: string
    stepId: string
  }>()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const classroomBase = `/c/${clientId}/classroom`

  const module = modules.find((m) => m.id === moduleId)

  // Module not found
  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          Module not found
        </h1>
        <p className="text-muted-foreground">
          The module you're looking for doesn't exist.
        </p>
        <Button asChild variant="outline">
          <Link to={classroomBase}>
            <ArrowLeft className="h-4 w-4" />
            Back to Classroom
          </Link>
        </Button>
      </div>
    )
  }

  // No step specified — redirect to first step
  if (!stepId) {
    return (
      <Navigate to={`${classroomBase}/${module.id}/${module.steps[0].id}`} replace />
    )
  }

  const currentStep = module.steps.find((s) => s.id === stepId)
  const currentIndex = module.steps.findIndex((s) => s.id === stepId)
  const prevStep = currentIndex > 0 ? module.steps[currentIndex - 1] : null
  const nextStep =
    currentIndex < module.steps.length - 1
      ? module.steps[currentIndex + 1]
      : null

  // Step not found within module — redirect to first
  if (!currentStep) {
    return (
      <Navigate to={`${classroomBase}/${module.id}/${module.steps[0].id}`} replace />
    )
  }

  function handleComplete() {
    if (nextStep) {
      navigate(`${classroomBase}/${module!.id}/${nextStep.id}`)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block">
        <StepSidebar module={module} currentStepId={stepId} />
      </div>

      {/* Mobile sidebar — sheet overlay */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 md:hidden" showCloseButton={false}>
          <SheetTitle className="sr-only">Module Steps</SheetTitle>
          <StepSidebar module={module} currentStepId={stepId} onStepClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Back link + mobile menu button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open module menu</span>
            </Button>
            <Link
              to=".."
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Classroom
            </Link>
          </div>

          {/* Step title */}
          <h1 className="text-2xl font-bold text-foreground">
            {currentStep.title}
          </h1>

          {/* Video player */}
          <VideoPlayer
            videoUrl={currentStep.videoUrl}
            title={currentStep.title}
          />

          {/* Instructions */}
          <StepInstructions instructions={currentStep.instructions} />

          {/* Action area by step type */}
          <StepActionArea step={currentStep} />

          {/* GHL path selector for api-setup-2 */}
          {currentStep.id === 'api-setup-2' && <GhlPathSelector />}

          {/* Credential fields for this module */}
          <ClassroomCredentials stepId={currentStep.id} />

          {/* Mark complete */}
          <MarkComplete stepId={currentStep.id} onComplete={handleComplete} />

          {/* Step navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {prevStep ? (
              <Button asChild variant="ghost" size="sm">
                <Link
                  to={`${classroomBase}/${module.id}/${prevStep.id}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextStep ? (
              <Button asChild variant="ghost" size="sm">
                <Link
                  to={`${classroomBase}/${module.id}/${nextStep.id}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ---------- Step type action areas ---------- */

import type { Step } from '@/data/types'

function StepActionArea({ step }: { step: Step }) {
  const { clientId } = useParams()
  const isVoice = step.id.includes('voice') || step.moduleId.includes('voice')
  const promptPath = isVoice
    ? `/c/${clientId}/management/prompts/voice`
    : `/c/${clientId}/management/prompts/text`

  switch (step.type) {
    case 'setup':
      return <SetupChecklist instructions={step.instructions} />
    case 'config':
      return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Customize your AI prompts in the Management section
          </p>
          <p className="text-xs text-muted-foreground">
            Edit persona, greeting, qualification questions, and knowledge base for your {isVoice ? 'voice' : 'text'} agent.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to={promptPath}>
              Go to {isVoice ? 'Voice' : 'Text'} Prompts
            </Link>
          </Button>
        </div>
      )
    case 'demo':
      return (
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Demo Coming Soon
          </p>
          <p className="text-xs text-muted-foreground">
            We'll embed a live test here once your agent is deployed.
          </p>
        </div>
      )
    case 'info':
    default:
      return null
  }
}

function SetupChecklist({ instructions }: { instructions: string }) {
  const lines = instructions.split('\n')
  const checkItems = lines.filter((l) => {
    const t = l.trim()
    return (
      t.startsWith('- ') ||
      t.startsWith('* ') ||
      t.startsWith('✅') ||
      t.startsWith('☐')
    )
  })

  if (checkItems.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Setup Checklist</p>
      <div className="space-y-2">
        {checkItems.map((item, i) => {
          const text = item
            .trim()
            .replace(/^[-*✅☐]\s*/, '')
            .replace(/\*\*/g, '')
          return (
            <label
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground cursor-default"
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-primary"
                readOnly
              />
              <span>{text}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function GhlPathSelector() {
  const [path, setPath] = useState<'own' | 'sub' | null>(() => {
    return localStorage.getItem('ghl-path') as 'own' | 'sub' | null
  })

  const handleSelect = (p: 'own' | 'sub') => {
    setPath(p)
    localStorage.setItem('ghl-path', p)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Choose Your GHL Path</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => handleSelect('own')}
          className={cn(
            'rounded-lg border p-4 text-left transition-colors',
            path === 'own'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          )}
        >
          <p className="text-sm font-medium text-foreground">Option A: Own Account</p>
          <p className="text-xs text-muted-foreground mt-1">$297/month — full control, direct billing</p>
        </button>
        <button
          onClick={() => handleSelect('sub')}
          className={cn(
            'rounded-lg border p-4 text-left transition-colors',
            path === 'sub'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/30'
          )}
        >
          <p className="text-sm font-medium text-foreground">Option B: Sub-Account</p>
          <p className="text-xs text-muted-foreground mt-1">Included — we set it up for you</p>
        </button>
      </div>
      {path === 'sub' && (
        <p className="text-xs text-muted-foreground">
          Your CSM will send you login credentials. Enter them below once received.
        </p>
      )}
    </div>
  )
}
