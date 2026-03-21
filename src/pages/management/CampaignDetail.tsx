import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Pause,
  Trash2,
  Upload,
  Download,
  Rocket,
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  Globe,
  Layers,
  Timer,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  FileDown,
  Search,
} from 'lucide-react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { exportToCsv } from '@/lib/csv-export'
import { type Campaign } from '@/hooks/useCampaigns'
import { useLeads, type Lead } from '@/hooks/useLeads'
import { useCampaignExecutor } from '@/contexts/CampaignExecutorContext'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  batch_processing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
}

const leadStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

const leadStatusLabels: Record<string, string> = {
  pending: 'Not Sent',
  processing: 'Sending…',
  completed: 'Sent',
  failed: 'Failed',
}

interface ExecutionLog {
  id: string
  campaign_id: string
  execution_time: string
  webhook_response: Record<string, unknown> | null
  created_at: string
}

/** Countdown timer — shows pacing info based on campaign config */
function NextLeadCountdown({
  campaign,
  pendingCount,
  processingCount,
}: {
  campaign: Campaign
  pendingCount: number
  processingCount: number
}) {
  if (pendingCount === 0 && processingCount === 0) return null

  if (processingCount > 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Sending now…
      </span>
    )
  }

  const leadDelay = campaign.lead_delay_seconds ?? 0
  const label = leadDelay > 0
    ? `Pacing: ${leadDelay}s between leads`
    : `Batch every ${campaign.batch_interval_minutes ?? 1}m`

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-muted-foreground">
      <Timer className="h-3 w-3" />
      {label}
    </span>
  )
}

function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]
      })
      rows.push(row)
    }
  }

  return rows
}

export default function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { clientDb, connection } = useClientSupabase()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [campaignLoading, setCampaignLoading] = useState(true)
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null)

  // Server-side paginated leads
  const {
    leads,
    loading: leadsLoading,
    counts: leadCounts,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFiltered,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useLeads(campaignId ?? '')

  // Bulk selection
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  const executor = useCampaignExecutor()

  // Fetch campaign from client's DB
  const fetchCampaign = useCallback(async (silent = false) => {
    if (!campaignId || !clientDb) { setCampaignLoading(false); return }
    if (!silent) setCampaignLoading(true)
    const { data, error } = await clientDb
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()
    if (!error && data) setCampaign(data)
    setCampaignLoading(false)
  }, [campaignId, clientDb])

  // Fetch execution logs from client's DB
  const fetchLogs = useCallback(async (silent = false) => {
    if (!campaignId || !clientDb) { setLogsLoading(false); return }
    if (!silent) setLogsLoading(true)
    const { data, error } = await clientDb
      .from('execution_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('execution_time', { ascending: false })
    if (!error && data) setExecutionLogs(data)
    setLogsLoading(false)
  }, [campaignId, clientDb])

  useEffect(() => {
    fetchCampaign()
    fetchLogs()

    if (!clientDb || !campaignId) return

    // Realtime for campaign updates
    const campaignChannel = clientDb
      .channel(`campaign-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` },
        () => fetchCampaign(true)
      )
      .subscribe()

    // Realtime for execution logs
    const logsChannel = clientDb
      .channel(`logs-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'execution_logs', filter: `campaign_id=eq.${campaignId}` },
        () => fetchLogs(true)
      )
      .subscribe()

    return () => {
      clientDb.removeChannel(campaignChannel)
      clientDb.removeChannel(logsChannel)
    }
  }, [campaignId, clientDb, fetchCampaign, fetchLogs])

  // AUTO-POLLING: When campaign is active and has pending leads,
  // automatically kick the edge function based on lead_delay / batch_interval config.
  // This replaces the dependency on pg_cron — no idle costs, works immediately.
  useEffect(() => {
    if (!campaign) return
    const isActive = campaign.status === 'active' || campaign.status === 'processing'
    const hasPending = leads.some((l) => l.status === 'pending')
    if (!isActive || !hasPending) return

    const leadDelay = campaign.lead_delay_seconds || 0
    const batchInterval = (campaign.batch_interval_minutes || 1) * 60

    // Determine polling interval in seconds:
    // - With lead_delay: poll every lead_delay seconds (min 10s to avoid spam)
    // - Without lead_delay: poll every batch_interval seconds (min 30s)
    const intervalSec = leadDelay > 0
      ? Math.max(leadDelay, 10)
      : Math.max(batchInterval, 30)

    const timer = setInterval(() => {
      executor.tick(campaign)
    }, intervalSec * 1000)

    return () => clearInterval(timer)
  }, [campaign?.id, campaign?.status, campaign?.lead_delay_seconds, campaign?.batch_interval_minutes, leadCounts.total, executor])

  const handleDelete = async () => {
    if (!campaign || !clientDb) return
    try {
      const { error } = await clientDb.rpc('delete_campaign_with_data', {
        campaign_id_param: campaign.id,
      })
      if (error) throw error
      toast.success('Campaign deleted')
      navigate(-1)
    } catch {
      toast.error('Failed to delete campaign')
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !campaignId || !clientDb) return

    setImporting(true)
    setImportProgress(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        toast.error('No valid data rows found in CSV')
        setImporting(false)
        return
      }

      setImportProgress({ current: 0, total: rows.length })

      const BATCH_SIZE = 500
      let imported = 0

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        const leadsToInsert = batch.map((row) => ({
          campaign_id: campaignId,
          name: [row['first name'], row['last name']].filter(Boolean).join(' ') || row.name || null,
          email: row['email'] || null,
          phone: row['phone'] || null,
          data: row,
          status: 'pending' as const,
        }))

        const { error } = await clientDb.from('leads').insert(leadsToInsert)
        if (error) throw error

        imported += batch.length
        setImportProgress({ current: imported, total: rows.length })
      }

      // Update campaign total_leads count
      const { error: updateError } = await clientDb
        .from('campaigns')
        .update({ total_leads: (campaign?.total_leads ?? 0) + rows.length })
        .eq('id', campaignId)
      if (updateError) throw updateError

      toast.success(`Successfully imported ${rows.length} leads`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import CSV'
      toast.error(message)
    } finally {
      setImporting(false)
      setImportProgress(null)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExportCSV = () => {
    const rows = leads.map((lead) => ({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: (lead.data?.['company'] as string) || (lead.data?.['Company'] as string) || '',
      status: lead.status,
      processed_at: lead.processed_at || '',
      error_message: lead.error_message || '',
    }))
    exportToCsv(rows, `${campaign?.campaign_name || 'leads'}-export.csv`)
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!clientDb || selectedLeads.size === 0) return
    try {
      const { error } = await clientDb
        .from('leads')
        .update({ status: newStatus })
        .in('id', [...selectedLeads])
      if (error) throw error
      toast.success(`Updated ${selectedLeads.size} leads to "${newStatus}"`)
      setSelectedLeads(new Set())
    } catch {
      toast.error('Failed to update leads')
    }
  }

  const handleBulkDelete = async () => {
    if (!clientDb || selectedLeads.size === 0) return
    try {
      const { error } = await clientDb
        .from('leads')
        .delete()
        .in('id', [...selectedLeads])
      if (error) throw error
      toast.success(`Deleted ${selectedLeads.size} leads`)
      setSelectedLeads(new Set())
    } catch {
      toast.error('Failed to delete leads')
    }
  }

  if (campaignLoading) {
    return <CampaignDetailSkeleton />
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Campaign not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Use server-side counts for progress — not filtered by current page
  const pendingCount = leadCounts.pending
  const successCount = leadCounts.completed
  const failedCount = leadCounts.failed
  const stuckCount = leadCounts.processing
  const totalLeadCount = leadCounts.total
  const totalProcessed = successCount + failedCount
  const progressPct =
    totalLeadCount > 0
      ? Math.round((totalProcessed / totalLeadCount) * 100)
      : 0
  const hasWebhook = !!(campaign.webhook_url || connection?.campaign_webhook_url)
  const isActive = campaign.status === 'active' || campaign.status === 'processing'
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{campaign.campaign_name}</h1>
          <Badge
            variant="secondary"
            className={statusColors[campaign.status] ?? 'bg-gray-100 text-gray-700'}
          >
            {campaign.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button variant="outline" size="sm" onClick={() => executor.pause(campaign)}>
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <>
              {/* Resume / Launch — available when there are pending leads */}
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={() => executor.launch(campaign, Array.from({ length: pendingCount }, (_, i) => ({ id: String(i) } as Lead)))}
                  disabled={!hasWebhook || executor.launching}
                >
                  {executor.launching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Rocket className="h-4 w-4" />
                  )}
                  {campaign.status === 'paused'
                    ? 'Resume Campaign'
                    : campaign.status === 'completed'
                    ? 'Re-launch Campaign'
                    : 'Launch Campaign'}
                </Button>
              )}
              {/* Retry failed leads */}
              {failedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executor.retryFailed(campaign)}
                  disabled={executor.launching}
                >
                  {executor.launching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Retry {failedCount} Failed
                </Button>
              )}
            </>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Running status banner — driven by DB status via realtime */}
      {isActive && (
        <Alert>
          <AlertDescription className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />
              {stuckCount > 0 ? (
                <>
                  Processing: <span className="font-medium">{stuckCount} lead{stuckCount > 1 ? 's' : ''}</span>
                </>
              ) : (
                <span>Campaign running on server…</span>
              )}
              &nbsp;·&nbsp;{successCount} sent, {pendingCount} pending
              {failedCount > 0 && (
                <span className="text-destructive">, {failedCount} failed</span>
              )}
            </div>
            <NextLeadCountdown campaign={campaign} pendingCount={pendingCount} processingCount={stuckCount} />
          </AlertDescription>
        </Alert>
      )}

      {/* Stuck processing leads banner — edge function may have crashed */}
      {!isActive && stuckCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {stuckCount} lead{stuckCount > 1 ? 's are' : ' is'} stuck in "processing" — this usually means a previous run was interrupted.
            </span>
            <Button variant="outline" size="sm" onClick={() => executor.resetStuckLeads(campaign)}>
              <RotateCcw className="h-4 w-4" />
              Reset to Pending
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Failed leads banner — show when campaign is done/paused with failures */}
      {!isActive && failedCount > 0 && pendingCount === 0 && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {failedCount} lead{failedCount > 1 ? 's' : ''} failed. You can retry them without affecting completed leads.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executor.retryFailed(campaign)}
              disabled={executor.launching}
            >
              <RotateCcw className="h-4 w-4" />
              Retry Failed
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No webhook warning */}
      {!hasWebhook && pendingCount > 0 && !isActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure <strong>Campaign Webhook (per-lead)</strong> in Credentials → Webhooks to launch this campaign.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection info (debug) */}
      {connection?.id && (
        <div className="sr-only" aria-hidden="true">
          Client: {connection.id}
        </div>
      )}

      {/* Progress Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {totalProcessed} / {totalLeadCount} leads ({progressPct}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              {/* Stacked bar: green for success, red for failed */}
              <div className="flex h-3 overflow-hidden rounded-full">
                {successCount > 0 && (
                  <div
                    className="h-3 bg-green-500 transition-all"
                    style={{ width: `${totalLeadCount > 0 ? (successCount / totalLeadCount) * 100 : 0}%` }}
                  />
                )}
                {failedCount > 0 && (
                  <div
                    className="h-3 bg-red-400 transition-all"
                    style={{ width: `${totalLeadCount > 0 ? (failedCount / totalLeadCount) * 100 : 0}%` }}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{totalLeadCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-lg font-bold">{successCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-lg font-bold">{failedCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads ({totalLeadCount})</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* CSV Import */}
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Import Leads from CSV</h3>
                <p className="text-xs text-muted-foreground">
                  CSV must have headers. Columns matching name, email, and phone will be
                  auto-detected.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {importProgress && (
                  <span className="text-xs text-muted-foreground">
                    {importProgress.current} / {importProgress.total}
                  </span>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <a href="/lead_database_template.csv" download>
                    <Download className="h-4 w-4" />
                    Template
                  </a>
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVImport}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={importing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {importing ? 'Importing...' : 'Upload CSV'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={totalLeadCount === 0}
                  onClick={handleExportCSV}
                >
                  <FileDown className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          {leadsLoading ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : totalLeadCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-sm font-semibold">No leads yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Import leads from a CSV file to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filter Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => setStatusFilter(val)}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {totalFiltered} of {totalLeadCount} leads
                </span>
              </div>

              {/* Bulk Actions Bar */}
              {selectedLeads.size > 0 && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">{selectedLeads.size} selected</span>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('completed')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('failed')}
                  >
                    <XCircle className="h-4 w-4" />
                    Mark as Failed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('pending')}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Pending
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            leads.length > 0 &&
                            leads.every((l) => selectedLeads.has(l.id))
                          }
                          onCheckedChange={(checked) => {
                            setSelectedLeads((prev) => {
                              const next = new Set(prev)
                              if (checked) {
                                leads.forEach((l) => next.add(l.id))
                              } else {
                                leads.forEach((l) => next.delete(l.id))
                              }
                              return next
                            })
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: Lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={(checked) => {
                              setSelectedLeads((prev) => {
                                const next = new Set(prev)
                                if (checked) {
                                  next.add(lead.id)
                                } else {
                                  next.delete(lead.id)
                                }
                                return next
                              })
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.name || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.email || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.phone || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {(lead.data?.['company'] as string) || (lead.data?.['Company'] as string) || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={leadStatusColors[lead.status] ?? 'bg-gray-100 text-gray-700'}
                          >
                            {leadStatusLabels[lead.status] ?? lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.processed_at
                            ? new Date(lead.processed_at).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {lead.error_message ? (
                            <span className="text-xs text-red-600">{lead.error_message}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Rows per page</Label>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => setPageSize(Number(val))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.reactivation_notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Reactivation Notes</p>
                  <p className="mt-1 text-sm">{campaign.reactivation_notes}</p>
                </div>
              )}

              {campaign.webhook_url && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Webhook URL</p>
                  <p className="mt-1 break-all text-sm font-mono">{campaign.webhook_url}</p>
                </div>
              )}

              <Separator />

              <h4 className="text-sm font-semibold">Scheduling</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Days of Week</p>
                    <p className="text-sm">
                      {campaign.days_of_week && campaign.days_of_week.length > 0
                        ? campaign.days_of_week.join(', ')
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Timezone</p>
                    <p className="text-sm">{campaign.timezone ?? 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Time</p>
                    <p className="text-sm">{campaign.start_time ?? 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">End Time</p>
                    <p className="text-sm">{campaign.end_time ?? 'Not set'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <h4 className="text-sm font-semibold">Batch Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Batch Size</p>
                    <p className="text-sm">{campaign.batch_size ?? 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Batch Interval</p>
                    <p className="text-sm">
                      {campaign.batch_interval_minutes != null
                        ? `${campaign.batch_interval_minutes} min`
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lead Delay</p>
                    <p className="text-sm">
                      {campaign.lead_delay_seconds != null
                        ? `${campaign.lead_delay_seconds} sec`
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* scheduled_for is now on individual leads, not campaigns */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {logsLoading ? (
            <Card>
              <CardContent className="space-y-3 pt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : executionLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-sm font-semibold">No execution logs yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Logs will appear here once the campaign starts processing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {executionLogs.map((log) => (
                <ExecutionLogItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ExecutionLogItem({ log }: { log: ExecutionLog }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50">
            <div className="flex items-center gap-3">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {new Date(log.execution_time).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Log ID: {log.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              executed
            </Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Webhook Response</p>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
              {log.webhook_response
                ? JSON.stringify(log.webhook_response, null, 2)
                : 'No response data'}
            </pre>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
