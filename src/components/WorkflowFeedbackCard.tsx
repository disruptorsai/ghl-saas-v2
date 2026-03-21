import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  MessageSquare,
  Image,
  Video,
  Send,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FeedbackEntry } from '@/hooks/useFeedback'

interface WorkflowFeedbackCardProps {
  workflowId: string
  workflowName: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  feedback: FeedbackEntry[]
  onSubmit: (data: { workflow: string; rating: number; comment: string }) => Promise<void>
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-colors hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`size-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'resolved'
      ? 'default'
      : status === 'reviewed'
        ? 'secondary'
        : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

function RelativeTime({ date }: { date: string }) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  let text: string
  if (diffMins < 1) text = 'just now'
  else if (diffMins < 60) text = `${diffMins}m ago`
  else if (diffHours < 24) text = `${diffHours}h ago`
  else if (diffDays < 30) text = `${diffDays}d ago`
  else text = new Date(date).toLocaleDateString()

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {text}
    </span>
  )
}

function FeedbackStars({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  )
}

export function WorkflowFeedbackCard({
  workflowId,
  workflowName,
  description,
  imageUrl,
  videoUrl,
  feedback,
  onSubmit,
}: WorkflowFeedbackCardProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment')
      return
    }
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ workflow: workflowId, rating, comment: comment.trim() })
      toast.success('Feedback submitted!')
      setRating(0)
      setComment('')
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const displayedFeedback = feedback.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5" />
          {workflowName}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Flowchart placeholder / image */}
        <div>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${workflowName} workflow diagram`}
              className="w-full rounded-lg border object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8">
              <Image className="size-8 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">
                Workflow Diagram
              </span>
            </div>
          )}
        </div>

        {/* Video placeholder / embed */}
        <div>
          {videoUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <iframe
                src={videoUrl}
                title={`${workflowName} video walkthrough`}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8">
              <Video className="size-8 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">
                Video Walkthrough
              </span>
            </div>
          )}
        </div>

        {/* Feedback form */}
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-medium">Leave Feedback</h4>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            placeholder="Share your feedback, questions, or suggestions..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="sm"
            className="gap-2"
          >
            <Send className="size-4" />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>

        {/* Existing feedback list */}
        {displayedFeedback.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Feedback ({feedback.length})
            </h4>
            <div className="space-y-2">
              {displayedFeedback.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-md border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {entry.user_email || 'Anonymous'}
                    </span>
                    <FeedbackStars rating={entry.rating} />
                    <StatusBadge status={entry.status} />
                    <RelativeTime date={entry.created_at} />
                  </div>
                  {entry.comment && (
                    <p className="text-muted-foreground">{entry.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
