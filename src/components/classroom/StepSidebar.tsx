import { NavLink } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Module } from '@/data/types'
import { useProgress } from '@/hooks/useProgress'
import { cn } from '@/lib/utils'

interface StepSidebarProps {
  module: Module
  currentStepId: string
  onStepClick?: () => void
}

export function StepSidebar({ module, currentStepId, onStepClick }: StepSidebarProps) {
  const { isStepCompleted, getModuleProgress } = useProgress()
  const { completed, total, percentage } = getModuleProgress(module.id)

  return (
    <aside className="w-[280px] shrink-0 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Module title & progress */}
      <div className="p-4 border-b border-border space-y-3">
        <h2 className="font-bold text-foreground text-sm leading-snug">
          {module.title}
        </h2>
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completed} of {total} completed
          </p>
        </div>
      </div>

      {/* Step list */}
      <nav className="py-2">
        <ol className="space-y-0.5">
          {module.steps.map((step) => {
            const done = isStepCompleted(step.id)
            const isActive = step.id === currentStepId

            return (
              <li key={step.id}>
                <NavLink
                  to={`../${step.id}`}
                  onClick={onStepClick}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'border-l-[3px] border-primary bg-primary/5 text-foreground'
                      : 'border-l-[3px] border-transparent hover:bg-muted/50',
                    done && !isActive && 'text-muted-foreground'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <Circle
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground/50'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'leading-snug',
                      done && !isActive && 'line-through decoration-muted-foreground/40'
                    )}
                  >
                    {step.title}
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}
