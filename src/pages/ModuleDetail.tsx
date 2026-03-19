import { useParams, Navigate, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { modules } from '@/data/modules'
import { StepSidebar } from '@/components/classroom/StepSidebar'
import { VideoPlayer } from '@/components/classroom/VideoPlayer'
import { StepInstructions } from '@/components/classroom/StepInstructions'
import { MarkComplete } from '@/components/classroom/MarkComplete'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function ModuleDetail() {
  const { moduleId, stepId } = useParams<{
    moduleId: string
    stepId: string
  }>()
  const navigate = useNavigate()

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
          <Link to="/classroom">
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
      <Navigate to={`/classroom/${module.id}/${module.steps[0].id}`} replace />
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
      <Navigate to={`/classroom/${module.id}/${module.steps[0].id}`} replace />
    )
  }

  function handleComplete() {
    if (nextStep) {
      navigate(`/classroom/${module!.id}/${nextStep.id}`)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left sidebar */}
      <StepSidebar module={module} currentStepId={stepId} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Back link */}
          <Link
            to="/classroom"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Classroom
          </Link>

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

          {/* Mark complete */}
          <MarkComplete stepId={currentStep.id} onComplete={handleComplete} />

          {/* Step navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {prevStep ? (
              <Button asChild variant="ghost" size="sm">
                <Link
                  to={`/classroom/${module.id}/${prevStep.id}`}
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
                  to={`/classroom/${module.id}/${nextStep.id}`}
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
  switch (step.type) {
    case 'setup':
      return <SetupChecklist instructions={step.instructions} />
    case 'config':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Customization Area
          </label>
          <Textarea
            placeholder="Customize your prompt here..."
            className="min-h-[120px] bg-muted/50"
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Read-only for now — editable once your agent is deployed.
          </p>
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
