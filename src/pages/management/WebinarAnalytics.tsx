import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, UserCheck, Play, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebinarSetup } from '@/hooks/useWebinarSetup'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '60d', label: 'Last 60 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
]

interface StatCard {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function WebinarAnalytics() {
  const { clientId } = useClientSupabase()
  const { setup, loading } = useWebinarSetup()
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (setup?.time_range) {
      setTimeRange(setup.time_range)
    }
  }, [setup])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const metrics = setup?.metrics ?? {}
  const registrations = (metrics.registrations as number) ?? 0
  const attendees = (metrics.attendees as number) ?? 0
  const replayViews = (metrics.replay_views as number) ?? 0
  const conversions = (metrics.conversions as number) ?? 0
  const hasData = registrations > 0 || attendees > 0 || replayViews > 0 || conversions > 0

  const stats: StatCard[] = [
    {
      title: 'Registrations',
      value: registrations,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Attendees',
      value: attendees,
      icon: UserCheck,
      color: 'text-green-500',
    },
    {
      title: 'Replay Views',
      value: replayViews,
      icon: Play,
      color: 'text-purple-500',
    },
    {
      title: 'Conversions',
      value: conversions,
      icon: TrendingUp,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/client/${clientId}/webinar-setup`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Webinar Analytics</h1>
          <p className="text-muted-foreground">
            Track webinar performance and engagement
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasData ? (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversion rate */}
          {registrations > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Rate</CardTitle>
                  <CardDescription>
                    Percentage of registrants who attended
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {Math.round((attendees / registrations) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {attendees} of {registrations} registrants
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Rate</CardTitle>
                  <CardDescription>
                    Percentage of attendees who converted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {attendees > 0 ? Math.round((conversions / attendees) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {conversions} of {attendees} attendees
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              No webinar analytics yet
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Analytics will appear here once your webinar starts receiving registrations and attendees.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to={`/client/${clientId}/webinar-setup/configuration`}>
                Configure Webinar
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
