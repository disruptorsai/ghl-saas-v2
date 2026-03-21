import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Settings,
  Key,
  BarChart3,
  Presentation,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebinarSetup } from '@/hooks/useWebinarSetup'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

interface QuickLink {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

export default function WebinarSetup() {
  const { clientId } = useClientSupabase()
  const { setup, loading } = useWebinarSetup()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  const completedSteps = [
    !!setup?.webinar_url,
    !!setup?.replay_url,
    !!setup?.metrics?.inbound_agent,
    !!setup?.metrics?.outbound_agent,
    !!setup?.time_range,
  ].filter(Boolean).length
  const totalSteps = 5
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  const quickLinks: QuickLink[] = [
    {
      title: 'Checklist',
      description: 'Track your webinar setup progress step by step',
      icon: CheckSquare,
      path: 'checklist',
    },
    {
      title: 'Configuration',
      description: 'Configure webinar URLs and time settings',
      icon: Settings,
      path: 'configuration',
    },
    {
      title: 'Credentials',
      description: 'Set up webinar agent credentials',
      icon: Key,
      path: 'credentials',
    },
    {
      title: 'Analytics',
      description: 'View webinar performance metrics',
      icon: BarChart3,
      path: 'analytics',
    },
    {
      title: 'Presentation Agent',
      description: 'Chat with the webinar presentation AI agent',
      icon: Presentation,
      path: '../webinar-presentation-agent',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Webinar Setup</h1>
        <p className="text-muted-foreground">
          Configure and manage your webinar automation
        </p>
      </div>

      {/* Setup progress card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Progress</CardTitle>
          <CardDescription>
            {completedSteps} of {totalSteps} steps completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all ${
                progressPercent === 100 ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {setup?.webinar_url && (
            <div className="flex items-center gap-2 pt-2 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Webinar URL:</span>
              <a
                href={setup.webinar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {setup.webinar_url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            to={`/c/${clientId}/management/webinar-setup/${link.path}`}
            className="block"
          >
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <link.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
