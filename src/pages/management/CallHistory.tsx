import { useState, useMemo } from 'react'
import { Phone, Play, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CredentialGate } from '@/components/CredentialGate'
import { useCallHistory } from '@/hooks/useCallHistory'
import type { Call } from '@/hooks/useCallHistory'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '-'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusColor(status: string): string {
  const s = status.toLowerCase()
  if (s === 'success' || s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'failed' || s === 'error') return 'bg-red-100 text-red-700'
  if (s === 'in_progress' || s === 'ringing') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function isWithinDays(iso: string, days: number): boolean {
  const now = Date.now()
  const then = new Date(iso).getTime()
  return now - then <= days * 86_400_000
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Phone className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          No calls found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Call history will appear here once voice calls are processed.
        </p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Call table
// ---------------------------------------------------------------------------

function CallTable({ calls }: { calls: Call[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recording</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(call.created_at)}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {call.phone_number ?? '-'}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDuration(call.duration)}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColor(call.status)}
                >
                  {call.status}
                </Badge>
              </TableCell>
              <TableCell>
                {call.recording_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 px-2"
                    asChild
                  >
                    <a
                      href={call.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="h-4 w-4" />
                      Play
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CallHistory() {
  const { calls, loading } = useCallHistory()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  const filtered = useMemo(() => {
    let result = calls

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => {
        const s = c.status.toLowerCase()
        if (statusFilter === 'success') return s === 'success' || s === 'completed'
        if (statusFilter === 'failed') return s === 'failed' || s === 'error'
        return true
      })
    }

    // Date range filter
    if (dateRange === 'today') {
      result = result.filter((c) => isWithinDays(c.created_at, 1))
    } else if (dateRange === '7d') {
      result = result.filter((c) => isWithinDays(c.created_at, 7))
    } else if (dateRange === '30d') {
      result = result.filter((c) => isWithinDays(c.created_at, 30))
    }

    return result
  }, [calls, statusFilter, dateRange])

  return (
    <CredentialGate>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Call History</h1>
            <p className="text-muted-foreground">
              Review voice call logs, recordings, and statuses
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading calls...</CardTitle>
            </CardHeader>
            <CardContent>
              <TableSkeleton />
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <CallTable calls={filtered} />
        )}
      </div>
    </CredentialGate>
  )
}
