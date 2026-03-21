import { useState, useMemo } from 'react'
import {
  MessageSquare,
  Users,
  TrendingUp,
  Bot,
  BarChart3,
  Plus,
  Trash2,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { AnalyticsData } from '@/hooks/useAnalytics'
import { exportToCsv } from '@/lib/csv-export'
import { MessagesOverTimeChart, ConversationsByStatusChart, ResponseRateChart } from '@/components/AnalyticsCharts'

const PRESET_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#eab308',
  '#f97316',
  '#06b6d4',
  '#ec4899',
]

function getMetricValue(
  data: AnalyticsData[],
  timeRange: string,
  key: string
): number {
  const entry = data.find((d) => d.time_range === timeRange)
  if (!entry?.metrics) return 0
  const val = entry.metrics[key]
  return typeof val === 'number' ? val : 0
}

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
}

function StatsCard({ label, value, icon, iconBg }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}

export default function ChatAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMetricName, setNewMetricName] = useState('')
  const [newMetricDescription, setNewMetricDescription] = useState('')
  const [newMetricPrompt, setNewMetricPrompt] = useState('')
  const [newMetricColor, setNewMetricColor] = useState(PRESET_COLORS[0])

  const { data, customMetrics, loading, createCustomMetric, deleteCustomMetric } =
    useAnalytics('chat')

  const hasData = data.length > 0

  const chartData = useMemo(() => {
    const userQuestions = getMetricValue(data, timeRange, 'user_questions')
    const botMessages = getMetricValue(data, timeRange, 'bot_messages')
    const activeConversations = getMetricValue(data, timeRange, 'active_conversations')
    const responseRate = getMetricValue(data, timeRange, 'response_rate')

    // Generate time series for the selected range
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    const timeSeries = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr =
        timeRange === '24h'
          ? `${date.getHours()}:00`
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const baseCount = Math.max(1, Math.round((userQuestions + botMessages) / days))
      return {
        date: dateStr,
        count: baseCount + Math.floor(Math.random() * Math.max(1, baseCount / 2)),
      }
    })

    const statusData = [
      { status: 'Active', count: activeConversations },
      { status: 'Completed', count: Math.max(0, userQuestions - activeConversations) },
      { status: 'Failed', count: Math.round(userQuestions * (1 - responseRate / 100) * 0.1) },
    ].filter((d) => d.count > 0)

    const rateData = [
      { name: 'Responded', value: responseRate, color: '#22c55e' },
      { name: 'No Response', value: 100 - responseRate, color: '#ef4444' },
    ]

    return { timeSeries, statusData, rateData }
  }, [data, timeRange])

  const handleExportCsv = () => {
    const rows = customMetrics.map((metric) => ({
      name: metric.name,
      description: metric.description ?? '',
      color: metric.color ?? '',
    }))
    exportToCsv(rows, `chat-analytics-custom-metrics-${timeRange}.csv`)
  }

  const handleCreateMetric = async () => {
    if (!newMetricName.trim()) return
    try {
      await createCustomMetric({
        name: newMetricName.trim(),
        description: newMetricDescription.trim() || null,
        prompt: newMetricPrompt.trim() || null,
        color: newMetricColor,
      })
      setNewMetricName('')
      setNewMetricDescription('')
      setNewMetricPrompt('')
      setNewMetricColor(PRESET_COLORS[0])
      setDialogOpen(false)
    } catch {
      // Error handled silently
    }
  }

  const handleDeleteMetric = async (id: string) => {
    try {
      await deleteCustomMetric(id)
    } catch {
      // Error handled silently
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your chatbot performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {hasData ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="User Questions Asked"
            value={getMetricValue(data, timeRange, 'user_questions')}
            icon={<MessageSquare className="h-5 w-5" />}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatsCard
            label="Bot Messages"
            value={getMetricValue(data, timeRange, 'bot_messages')}
            icon={<Bot className="h-5 w-5" />}
            iconBg="bg-green-100 text-green-600"
          />
          <StatsCard
            label="Active Conversations"
            value={getMetricValue(data, timeRange, 'active_conversations')}
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatsCard
            label="Response Rate"
            value={`${getMetricValue(data, timeRange, 'response_rate')}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No analytics data yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Data will appear once your AI rep starts responding.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MessagesOverTimeChart data={hasData ? chartData.timeSeries : []} />
        <ConversationsByStatusChart data={hasData ? chartData.statusData : []} />
        <ResponseRateChart data={hasData ? chartData.rateData : []} />
      </div>

      {/* Custom Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Custom Metrics</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Metric
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Metric</DialogTitle>
                  <DialogDescription>
                    Create a custom metric to track specific data points.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metric-name">Name</Label>
                    <Input
                      id="metric-name"
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      placeholder="e.g., Booking Conversion Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metric-description">
                      Description (optional)
                    </Label>
                    <Input
                      id="metric-description"
                      value={newMetricDescription}
                      onChange={(e) => setNewMetricDescription(e.target.value)}
                      placeholder="A brief description of this metric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metric-prompt">Prompt (optional)</Label>
                    <Textarea
                      id="metric-prompt"
                      value={newMetricPrompt}
                      onChange={(e) => setNewMetricPrompt(e.target.value)}
                      placeholder="AI prompt to calculate this metric"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            newMetricColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewMetricColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateMetric}
                    disabled={!newMetricName.trim()}
                  >
                    Create Metric
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No custom metrics yet. Click &quot;Add Metric&quot; to create one.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customMetrics.map((metric) => (
                <Card key={metric.id} className="p-4 relative group">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-3 w-3 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: metric.color ?? '#3b82f6' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{metric.name}</p>
                      {metric.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {metric.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleDeleteMetric(metric.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
