import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Phone,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { AnalyticsData } from '@/hooks/useAnalytics'

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

function AnalyticsTab({
  data,
  loading,
  timeRange,
  type,
  onViewDetails,
}: {
  data: AnalyticsData[]
  loading: boolean
  timeRange: string
  type: 'chat' | 'voice'
  onViewDetails: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    )
  }

  const hasData = data.length > 0

  if (!hasData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No analytics data yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Data will appear once your{' '}
            {type === 'chat' ? 'chatbot' : 'voice AI'} starts handling
            conversations.
          </p>
          <Button variant="outline" className="mt-4" onClick={onViewDetails}>
            Go to {type === 'chat' ? 'Chat' : 'Voice AI'} Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  const icons =
    type === 'chat'
      ? {
          first: <MessageSquare className="h-5 w-5" />,
          second: <MessageSquare className="h-5 w-5" />,
          third: <Users className="h-5 w-5" />,
          fourth: <TrendingUp className="h-5 w-5" />,
        }
      : {
          first: <Phone className="h-5 w-5" />,
          second: <Phone className="h-5 w-5" />,
          third: <Users className="h-5 w-5" />,
          fourth: <TrendingUp className="h-5 w-5" />,
        }

  const labels =
    type === 'chat'
      ? {
          first: 'User Questions',
          second: 'Bot Messages',
          third: 'Active Conversations',
          fourth: 'Response Rate',
        }
      : {
          first: 'Total Calls',
          second: 'Completed Calls',
          third: 'Active Sessions',
          fourth: 'Success Rate',
        }

  const keys =
    type === 'chat'
      ? {
          first: 'user_questions',
          second: 'bot_messages',
          third: 'active_conversations',
          fourth: 'response_rate',
        }
      : {
          first: 'total_calls',
          second: 'completed_calls',
          third: 'active_sessions',
          fourth: 'success_rate',
        }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label={labels.first}
          value={getMetricValue(data, timeRange, keys.first)}
          icon={icons.first}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatsCard
          label={labels.second}
          value={getMetricValue(data, timeRange, keys.second)}
          icon={icons.second}
          iconBg="bg-green-100 text-green-600"
        />
        <StatsCard
          label={labels.third}
          value={getMetricValue(data, timeRange, keys.third)}
          icon={icons.third}
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatsCard
          label={labels.fourth}
          value={`${getMetricValue(data, timeRange, keys.fourth)}%`}
          icon={icons.fourth}
          iconBg="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onViewDetails}>
          View Detailed {type === 'chat' ? 'Chat' : 'Voice AI'} Analytics
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Analytics() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('7d')

  const chatAnalytics = useAnalytics('chat')
  const voiceAnalytics = useAnalytics('voice')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your AI performance metrics
          </p>
        </div>
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
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4" />
            Chat Analytics
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Phone className="h-4 w-4" />
            Voice AI Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Analytics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsTab
                data={chatAnalytics.data}
                loading={chatAnalytics.loading}
                timeRange={timeRange}
                type="chat"
                onViewDetails={() => navigate('../chat-analytics')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice AI Analytics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsTab
                data={voiceAnalytics.data}
                loading={voiceAnalytics.loading}
                timeRange={timeRange}
                type="voice"
                onViewDetails={() => navigate('../voice-ai/dashboard')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
