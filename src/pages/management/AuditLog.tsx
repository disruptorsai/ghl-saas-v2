import { useState } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

import { CredentialGate } from '@/components/CredentialGate'
import { useAuditLog, type AuditLogRecord } from '@/hooks/useAuditLog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Download,
  Rocket,
  Pause,
  Clock,
  Filter,
  User,
} from 'lucide-react'

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'exported', label: 'Exported' },
  { value: 'launched', label: 'Launched' },
  { value: 'paused', label: 'Paused' },
]

const ENTITY_OPTIONS = [
  { value: 'all', label: 'All Entities' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'lead', label: 'Lead' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'knowledge_base', label: 'Knowledge Base' },
  { value: 'credential', label: 'Credential' },
  { value: 'demo_page', label: 'Demo Page' },
]

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
]

const ACTION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  created: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950' },
  updated: { icon: Pencil, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950' },
  deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950' },
  exported: { icon: Download, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950' },
  launched: { icon: Rocket, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950' },
  paused: { icon: Pause, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
}

const BADGE_VARIANTS: Record<string, string> = {
  created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  updated: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  exported: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  launched: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  paused: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function formatEntityType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function LogEntry({ log }: { log: AuditLogRecord }) {
  const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated
  const Icon = config.icon

  return (
    <div className="flex gap-4 relative">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center size-9 rounded-full shrink-0 ${config.bg}`}>
          <Icon className={`size-4 ${config.color}`} />
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium text-sm ${BADGE_VARIANTS[log.action] ? '' : ''}`}>
                <Badge
                  variant="secondary"
                  className={BADGE_VARIANTS[log.action] || ''}
                >
                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                </Badge>
              </span>
              <span className="text-sm text-muted-foreground">
                {formatEntityType(log.entity_type)}
              </span>
              {log.entity_name && (
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {log.entity_name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3" />
              <span>{log.user_email || 'System'}</span>
              <span className="mx-1">·</span>
              <Clock className="size-3" />
              <span title={new Date(log.created_at).toLocaleString()}>
                {formatRelativeTime(log.created_at)}
              </span>
            </div>
          </div>
        </div>
        {log.details && Object.keys(log.details).length > 0 && (
          <Card className="mt-2 p-3 text-xs text-muted-foreground bg-muted/50">
            <pre className="whitespace-pre-wrap font-mono">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
        <Activity className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No activity yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Actions performed on this client will appear here as an activity log.
      </p>
    </div>
  )
}

export default function AuditLog() {
  const { clientId } = useClientSupabase()
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('all')

  const { logs, loading, hasMore, loadMore } = useAuditLog(clientId ?? undefined, {
    action: actionFilter,
    entityType: entityFilter,
    dateRange: dateFilter,
  })

  return (
    <CredentialGate>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all actions and changes made to this client.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span>Filter by:</span>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Log Timeline */}
        <Card className="p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </CredentialGate>
  )
}
