import { useMemo } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { useFeedback } from '@/hooks/useFeedback'
import { WorkflowFeedbackCard } from '@/components/WorkflowFeedbackCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, CheckCircle, Inbox } from 'lucide-react'

const WORKFLOWS = [
  {
    id: 'text_ai',
    name: 'Text AI Rep',
    description: 'AI-powered text conversation agent for lead engagement',
  },
  {
    id: 'voice_ai',
    name: 'Voice AI Rep',
    description: 'AI-powered voice agent for outbound and inbound calls',
  },
  {
    id: 'campaigns',
    name: 'Database Reactivation',
    description: 'Automated campaign system for re-engaging dormant leads',
  },
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    description: 'AI knowledge management and document processing',
  },
  {
    id: 'deployment',
    name: 'Deployment & Integration',
    description: 'n8n workflow deployment and webhook configuration',
  },
  {
    id: 'general',
    name: 'General Feedback',
    description: 'Overall experience and suggestions',
  },
]

function FeedbackSummary({
  feedback,
}: {
  feedback: Array<{
    rating: number | null
    status: string
  }>
}) {
  const total = feedback.length
  const rated = feedback.filter((f) => f.rating !== null)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, f) => sum + (f.rating || 0), 0) / rated.length).toFixed(1)
      : null

  const newCount = feedback.filter((f) => f.status === 'new').length
  const reviewedCount = feedback.filter((f) => f.status === 'reviewed').length
  const resolvedCount = feedback.filter((f) => f.status === 'resolved').length

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Feedback</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10">
            <Star className="size-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{avgRating ?? '--'}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Inbox className="size-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{newCount} new</Badge>
              <Badge variant="secondary">{reviewedCount} reviewed</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">By Status</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
            <CheckCircle className="size-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ClientFeedback() {
  const { clientId } = useClientSupabase()
  const { feedback, loading, submitFeedback } = useFeedback(clientId)

  const feedbackByWorkflow = useMemo(() => {
    const map: Record<string, typeof feedback> = {}
    for (const wf of WORKFLOWS) {
      map[wf.id] = feedback.filter((f) => f.workflow === wf.id)
    }
    return map
  }, [feedback])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Client Feedback
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review and provide feedback on each workflow area
        </p>
      </div>

      <FeedbackSummary feedback={feedback} />

      <div className="grid gap-6 lg:grid-cols-2">
        {WORKFLOWS.map((wf) => (
          <WorkflowFeedbackCard
            key={wf.id}
            workflowId={wf.id}
            workflowName={wf.name}
            description={wf.description}
            feedback={feedbackByWorkflow[wf.id] || []}
            onSubmit={submitFeedback}
          />
        ))}
      </div>
    </div>
  )
}
