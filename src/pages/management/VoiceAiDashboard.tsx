import { useNavigate } from 'react-router-dom'
import { CredentialGate } from '@/components/CredentialGate'
import {
  Phone,
  PhoneCall,
  Users,
  TrendingUp,
  BarChart3,
  ArrowRight,
  MessageCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { AnalyticsData } from '@/hooks/useAnalytics'

function getMetricValue(data: AnalyticsData[], key: string): number {
  const entry = data[0]
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

export default function VoiceAiDashboard() {
  const navigate = useNavigate()
  const { data, loading } = useAnalytics('voice')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
    )
  }

  const hasData = data.length > 0

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Voice AI Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your voice AI performance
        </p>
      </div>

      {/* Stats Grid */}
      {hasData ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Total Calls"
            value={getMetricValue(data, 'total_calls')}
            icon={<Phone className="h-5 w-5" />}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatsCard
            label="Completed Calls"
            value={getMetricValue(data, 'completed_calls')}
            icon={<PhoneCall className="h-5 w-5" />}
            iconBg="bg-green-100 text-green-600"
          />
          <StatsCard
            label="Active Sessions"
            value={getMetricValue(data, 'active_sessions')}
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatsCard
            label="Success Rate"
            value={`${getMetricValue(data, 'success_rate')}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No voice AI data yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Analytics will appear once your voice AI starts handling calls.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Voice-Specific Metrics */}
      {hasData && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg. Call Duration
                </p>
                <p className="text-xl font-bold">
                  {getMetricValue(data, 'avg_call_duration')}s
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Inbound Calls</p>
                <p className="text-xl font-bold">
                  {getMetricValue(data, 'inbound_calls')}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Outbound Calls</p>
                <p className="text-xl font-bold">
                  {getMetricValue(data, 'outbound_calls')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('../voice-ai/chat-with-ai')}
        >
          <MessageCircle className="h-4 w-4" />
          Voice AI Chat
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('../analytics')}
        >
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Voice Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('../voice-ai/chat-with-ai')}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="space-y-3">
              {data.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {entry.analytics_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.time_range} range
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.last_updated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No recent voice activity to display.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
