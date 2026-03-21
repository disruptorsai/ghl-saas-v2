import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  Zap,
  Users,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  Phone,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/useDashboard'
import { CredentialStatusBanner } from '@/components/CredentialStatusBanner'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { stats, client, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Quick actions skeleton */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </div>

        {/* Recent activity skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credential Status */}
      <CredentialStatusBanner />

      {/* Data Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">Client Database Error</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold">
          {client?.name ?? 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">Welcome back</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Campaigns"
          value={stats.totalCampaigns}
          icon={<Megaphone className="h-5 w-5" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatsCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          icon={<Zap className="h-5 w-5" />}
          iconBg="bg-green-100 text-green-600"
        />
        <StatsCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatsCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('campaigns')}
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('campaigns')}
        >
          <Eye className="h-4 w-4" />
          View Campaigns
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('text-ai-rep')}
        >
          <MessageSquare className="h-4 w-4" />
          Text AI Rep
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('voice-ai-rep')}
        >
          <Phone className="h-4 w-4" />
          Voice AI Rep
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.totalCampaigns === 0 ? (
            <p className="text-muted-foreground">
              No campaigns yet. Create your first campaign to get started.
            </p>
          ) : (
            <p className="text-muted-foreground">
              You have {stats.totalCampaigns} campaign
              {stats.totalCampaigns === 1 ? '' : 's'} with{' '}
              {stats.processedLeads} of {stats.totalLeads} leads processed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
