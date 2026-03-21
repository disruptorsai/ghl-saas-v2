import { useState, useMemo } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Plus,
  Megaphone,
  MoreHorizontal,
  Eye,
  Pause,
  Play,
  Trash2,
  Download,
  ArrowUpDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCampaigns, type Campaign } from '@/hooks/useCampaigns'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { exportToCsv } from '@/lib/csv-export'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  batch_processing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC',
]

const STATUS_OPTIONS = ['All', 'Pending', 'Active', 'Processing', 'Completed', 'Paused', 'Failed']

type SortKey = 'campaign_name' | 'status' | 'total_leads' | 'created_at'
type SortDir = 'asc' | 'desc'

interface CreateFormData {
  campaign_name: string
  reactivation_notes: string
  days_of_week: string[]
  start_time: string
  end_time: string
  timezone: string
  batch_size: string
  batch_interval_minutes: string
  lead_delay_seconds: string
}

const defaultFormData: CreateFormData = {
  campaign_name: '',
  reactivation_notes: '',
  days_of_week: [],
  start_time: '',
  end_time: '',
  timezone: '',
  batch_size: '',
  batch_interval_minutes: '',
  lead_delay_seconds: '',
}

function SkeletonTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>Campaign Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProgressIndicator({ processed, total }: { processed: number; total: number }) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {processed}/{total}
      </span>
    </div>
  )
}

export default function Campaigns() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { connection } = useClientSupabase()
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign } =
    useCampaigns()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CreateFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)

  // Bulk selection state
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Filter/sort state
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Filtered and sorted campaigns
  const filteredSortedCampaigns = useMemo(() => {
    let result = [...campaigns]

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(
        (c) => c.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((c) =>
        c.campaign_name.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'campaign_name':
          cmp = a.campaign_name.localeCompare(b.campaign_name)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'total_leads':
          cmp = a.total_leads - b.total_leads
          break
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [campaigns, statusFilter, searchQuery, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />
    }
    return (
      <span className="ml-1 inline text-xs font-bold">
        {sortDir === 'asc' ? '\u2191' : '\u2193'}
      </span>
    )
  }

  // Selection helpers
  const allVisibleIds = filteredSortedCampaigns.map((c) => c.id)
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id))
  const someSelected = allVisibleIds.some((id) => selected.has(id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allVisibleIds))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedCampaigns = campaigns.filter((c) => selected.has(c.id))
  const hasActiveSelected = selectedCampaigns.some((c) => c.status === 'active')
  const hasPausedSelected = selectedCampaigns.some((c) => c.status === 'paused')

  const handleBulkPause = async () => {
    const toPause = selectedCampaigns.filter((c) => c.status === 'active')
    try {
      await Promise.all(toPause.map((c) => updateCampaign(c.id, { status: 'paused' })))
      toast.success(`Paused ${toPause.length} campaign${toPause.length > 1 ? 's' : ''}`)
      setSelected(new Set())
    } catch {
      toast.error('Failed to pause some campaigns')
    }
  }

  const handleBulkResume = async () => {
    const toResume = selectedCampaigns.filter((c) => c.status === 'paused')
    try {
      await Promise.all(toResume.map((c) => updateCampaign(c.id, { status: 'active' })))
      toast.success(`Resumed ${toResume.length} campaign${toResume.length > 1 ? 's' : ''}`)
      setSelected(new Set())
    } catch {
      toast.error('Failed to resume some campaigns')
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedCampaigns.map((c) => deleteCampaign(c.id)))
      toast.success(`Deleted ${selectedCampaigns.length} campaign${selectedCampaigns.length > 1 ? 's' : ''}`)
      setSelected(new Set())
      setDeleteConfirmOpen(false)
    } catch {
      toast.error('Failed to delete some campaigns')
    }
  }

  const handleExportCsv = () => {
    const rows = campaigns.map((c) => ({
      campaign_name: c.campaign_name,
      status: c.status,
      total_leads: c.total_leads,
      processed_leads: c.processed_leads,
      created_at: c.created_at,
    }))
    exportToCsv(rows, 'campaigns.csv')
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }))
  }

  const handleCreate = async () => {
    if (!connection?.database_reactivation_inbound_webhook_url) {
      toast.error('Set the Database Reactivation Webhook URL in Credentials \u2192 Webhooks first')
      return
    }
    if (!formData.campaign_name.trim()) {
      toast.error('Campaign name is required')
      return
    }
    setSubmitting(true)
    try {
      const payload: Partial<Campaign> & { campaign_name: string } = {
        campaign_name: formData.campaign_name.trim(),
      }
      if (formData.reactivation_notes.trim()) {
        payload.reactivation_notes = formData.reactivation_notes.trim()
      }
      if (formData.days_of_week.length > 0) {
        payload.days_of_week = formData.days_of_week
      }
      if (formData.start_time) payload.start_time = formData.start_time
      if (formData.end_time) payload.end_time = formData.end_time
      if (formData.timezone) payload.timezone = formData.timezone
      if (formData.batch_size) payload.batch_size = parseInt(formData.batch_size, 10)
      if (formData.batch_interval_minutes) {
        payload.batch_interval_minutes = parseInt(formData.batch_interval_minutes, 10)
      }
      if (formData.lead_delay_seconds) {
        payload.lead_delay_seconds = parseInt(formData.lead_delay_seconds, 10)
      }

      await createCampaign(payload)
      toast.success('Campaign created successfully')
      setDialogOpen(false)
      setFormData(defaultFormData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePauseResume = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === 'paused' ? 'active' : 'paused'
      await updateCampaign(campaign.id, { status: newStatus })
      toast.success(`Campaign ${newStatus === 'paused' ? 'paused' : 'resumed'}`)
    } catch {
      toast.error('Failed to update campaign status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id)
      toast.success('Campaign deleted')
    } catch {
      toast.error('Failed to delete campaign')
    }
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage your database reactivation campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campaigns.length > 0 && (
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (open && !connection?.database_reactivation_inbound_webhook_url) {
                toast.error('Set the Database Reactivation Webhook URL in Credentials \u2192 Webhooks first')
                return
              }
              setDialogOpen(open)
            }}>
            <DialogTrigger asChild>
              <Button disabled={!connection?.database_reactivation_inbound_webhook_url}>
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new database reactivation campaign.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name *</Label>
                  <Input
                    id="campaign_name"
                    placeholder="e.g. January Reactivation"
                    value={formData.campaign_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, campaign_name: e.target.value }))
                    }
                  />
                </div>

                {/* Reactivation Notes */}
                <div className="space-y-2">
                  <Label htmlFor="reactivation_notes">Reactivation Notes</Label>
                  <Textarea
                    id="reactivation_notes"
                    placeholder="Notes about this campaign..."
                    rows={3}
                    value={formData.reactivation_notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reactivation_notes: e.target.value }))
                    }
                  />
                </div>

                <Separator />

                {/* Scheduling */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Scheduling</h3>

                  {/* Days of Week */}
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          size="sm"
                          variant={formData.days_of_week.includes(day) ? 'default' : 'outline'}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Batch Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Batch Settings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch_size">Batch Size</Label>
                      <Input
                        id="batch_size"
                        type="number"
                        min={1}
                        placeholder="10"
                        value={formData.batch_size}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, batch_size: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batch_interval">Interval (min)</Label>
                      <Input
                        id="batch_interval"
                        type="number"
                        min={1}
                        placeholder="5"
                        value={formData.batch_interval_minutes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            batch_interval_minutes: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead_delay">Lead Delay (sec)</Label>
                      <Input
                        id="lead_delay"
                        type="number"
                        min={0}
                        placeholder="30"
                        value={formData.lead_delay_seconds}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lead_delay_seconds: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setFormData(defaultFormData)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable />
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {connection?.database_reactivation_inbound_webhook_url
                ? 'Create your first campaign to start reactivating leads.'
                : 'Set up your Database Reactivation Webhook in Credentials \u2192 Webhooks first.'}
            </p>
            <Button
              className="mt-4"
              disabled={!connection?.database_reactivation_inbound_webhook_url}
              onClick={() => {
                if (!connection?.database_reactivation_inbound_webhook_url) {
                  toast.error('Set the Database Reactivation Webhook URL in Credentials \u2192 Webhooks first')
                  return
                }
                setDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Search by campaign name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Bulk Actions Toolbar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2">
              <span className="text-sm font-medium">
                {selected.size} selected
              </span>
              <Separator orientation="vertical" className="h-5" />
              {hasActiveSelected && (
                <Button variant="outline" size="sm" onClick={handleBulkPause}>
                  <Pause className="h-4 w-4" />
                  Pause Selected
                </Button>
              )}
              {hasPausedSelected && (
                <Button variant="outline" size="sm" onClick={handleBulkResume}>
                  <Play className="h-4 w-4" />
                  Resume Selected
                </Button>
              )}
              <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Campaigns</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {selected.size} campaign{selected.size > 1 ? 's' : ''}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                >
                  <X className="h-4 w-4" />
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Campaign Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => toggleSort('campaign_name')}
                    >
                      Campaign Name
                      <SortIndicator columnKey="campaign_name" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => toggleSort('status')}
                    >
                      Status
                      <SortIndicator columnKey="status" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => toggleSort('total_leads')}
                    >
                      Leads
                      <SortIndicator columnKey="total_leads" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-foreground"
                      onClick={() => toggleSort('created_at')}
                    >
                      Created
                      <SortIndicator columnKey="created_at" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSortedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(campaign.id)}
                        onCheckedChange={() => toggleSelectOne(campaign.id)}
                        aria-label={`Select ${campaign.campaign_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-left font-medium text-primary hover:underline"
                        onClick={() => navigate(`/client/${clientId}/campaigns/${campaign.id}`)}
                      >
                        {campaign.campaign_name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[campaign.status] ?? 'bg-gray-100 text-gray-700'}
                      >
                        {campaign.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProgressIndicator
                        processed={campaign.processed_leads}
                        total={campaign.total_leads}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/client/${clientId}/campaigns/${campaign.id}`)}>
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePauseResume(campaign)}>
                            {campaign.status === 'paused' ? (
                              <>
                                <Play className="h-4 w-4" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-4 w-4" />
                                Pause
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
    </CredentialGate>
  )
}
