import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Circle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebinarSetup } from '@/hooks/useWebinarSetup'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

interface ChecklistItem {
  label: string
  description: string
  completed: boolean
  link: string
  linkLabel: string
}

export default function WebinarChecklist() {
  const { clientId } = useClientSupabase()
  const { setup, loading } = useWebinarSetup()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const items: ChecklistItem[] = [
    {
      label: 'Configure Webinar URL',
      description: 'Set up the live webinar URL for attendees',
      completed: !!setup?.webinar_url,
      link: `/client/${clientId}/webinar-setup/configuration`,
      linkLabel: 'Configure',
    },
    {
      label: 'Configure Replay URL',
      description: 'Set up the webinar replay URL for those who missed it',
      completed: !!setup?.replay_url,
      link: `/client/${clientId}/webinar-setup/configuration`,
      linkLabel: 'Configure',
    },
    {
      label: 'Set Up Webinar Agents',
      description: 'Configure inbound, outbound, and follow-up agent credentials',
      completed:
        !!setup?.metrics?.inbound_agent || !!setup?.metrics?.outbound_agent,
      link: `/client/${clientId}/webinar-setup/credentials`,
      linkLabel: 'Set Up',
    },
    {
      label: 'Configure Presentation Agent',
      description: 'Set up the AI presentation agent for your webinar',
      completed: !!setup?.metrics?.presentation_agent_configured,
      link: `/client/${clientId}/webinar-presentation-agent`,
      linkLabel: 'Configure',
    },
    {
      label: 'Test Webinar Flow',
      description: 'Review analytics and verify the entire webinar flow works',
      completed: !!setup?.metrics?.registrations && (setup.metrics.registrations as number) > 0,
      link: `/client/${clientId}/webinar-setup/analytics`,
      linkLabel: 'View Analytics',
    },
  ]

  const completedCount = items.filter((item) => item.completed).length
  const progressPercent = Math.round((completedCount / items.length) * 100)

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
        <div>
          <h1 className="text-2xl font-bold">Webinar Setup Checklist</h1>
          <p className="text-muted-foreground">
            Complete each step to get your webinar up and running
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {completedCount} of {items.length} steps completed
          </span>
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
      </div>

      {/* Checklist items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                {/* Step number + icon */}
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </span>
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      item.completed ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Action button */}
                <Button variant="outline" size="sm" asChild>
                  <Link to={item.link}>{item.linkLabel}</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
