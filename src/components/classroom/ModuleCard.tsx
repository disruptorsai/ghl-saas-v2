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
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { getModuleProgress } = useProgress()
  const { completed, total, percentage } = getModuleProgress(module.id)
  const Icon = moduleIcons[module.id] || Sparkles

  return (
    <Link
      to={`/classroom/${module.id}`}
      className="group block rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
    >
      {/* Thumbnail */}
      <div
        className={`relative aspect-video bg-gradient-to-br ${module.thumbnail} flex items-center justify-center`}
      >
        <Icon className="h-12 w-12 text-white/80 drop-shadow-lg" />
        <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
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
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completed} of {total} completed
          </p>
        </div>
      </div>
    </Link>
  )
}
