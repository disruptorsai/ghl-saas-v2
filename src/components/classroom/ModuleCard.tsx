import { Link } from 'react-router-dom'
import {
  Sparkles,
  Key,
  Phone,
  Database,
  MessageSquare,
  Clock,
  FileText,
  Star,
  Bot,
  Terminal,
  Lock,
} from 'lucide-react'
import type { Module } from '@/data/types'
import { useProgress } from '@/hooks/useProgress'
import type { LucideIcon } from 'lucide-react'

const moduleIcons: Record<string, LucideIcon> = {
  welcome: Sparkles,
  'api-setup': Key,
  'voice-receptionist': Phone,
  'db-reactivation': Database,
  'lead-followup': MessageSquare,
  'appointment-reminders': Clock,
  'quote-followup': FileText,
  'review-request': Star,
  'website-chatbot': Bot,
  'prompt-playground': Terminal,
}

interface ModuleCardProps {
  module: Module
  isLocked?: boolean
}

export function ModuleCard({ module, isLocked = false }: ModuleCardProps) {
  const { getModuleProgress } = useProgress()
  const { completed, total, percentage } = getModuleProgress(module.id)
  const Icon = moduleIcons[module.id] || Sparkles

  const card = (
    <div
      className={`group block rounded-xl bg-card border border-border cursor-pointer overflow-hidden card-hover relative${isLocked ? ' opacity-50 pointer-events-none' : ''}`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-xl">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {/* Thumbnail */}
      <div className="relative aspect-video bg-card flex items-center justify-center">
        <Icon className="h-12 w-12 icon-gold-shine" />
        <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary">
          {module.order}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {module.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
        <div className="space-y-1.5">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
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
    </div>
  )

  if (isLocked) return card

  return (
    <Link to={`${module.id}`}>
      {card}
    </Link>
  )
}
