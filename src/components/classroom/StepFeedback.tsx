import { useState, useRef } from 'react'
import { MessageSquare, Send, Image, Mic, Link2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FeedbackItem, FeedbackAttachment } from '@/data/types'

interface StepFeedbackProps {
  moduleId: string
  stepId: string
}

type FeedbackType = FeedbackItem['type']

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'comment', label: 'Comment' },
  { value: 'question', label: 'Question' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'suggestion', label: 'Suggestion' },
]

export function StepFeedback({ moduleId, stepId }: StepFeedbackProps) {
  const [expanded, setExpanded] = useState(false)
  const [type, setType] = useState<FeedbackType>('comment')
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([])
  const [showLoomInput, setShowLoomInput] = useState(false)
  const [loomUrl, setLoomUrl] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  function addFileAttachment(
    file: File,
    attachmentType: 'image' | 'audio',
  ) {
    const url = URL.createObjectURL(file)
    const attachment: FeedbackAttachment = {
      id: crypto.randomUUID(),
      type: attachmentType,
      url,
      name: file.name,
    }
    setAttachments((prev) => [...prev, attachment])
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) addFileAttachment(file, 'image')
    e.target.value = ''
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) addFileAttachment(file, 'audio')
    e.target.value = ''
  }

  function addLoomAttachment() {
    const trimmed = loomUrl.trim()
    if (!trimmed) return
    const attachment: FeedbackAttachment = {
      id: crypto.randomUUID(),
      type: 'loom',
      url: trimmed,
      name: 'Loom Video',
    }
    setAttachments((prev) => [...prev, attachment])
    setLoomUrl('')
    setShowLoomInput(false)
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function resetForm() {
    setType('comment')
    setMessage('')
    setAttachments([])
    setLoomUrl('')
    setShowLoomInput(false)
    setExpanded(false)
  }

  function handleSubmit() {
    if (!message.trim()) {
      toast.error('Please enter a message.')
      return
    }

    const item: FeedbackItem = {
      id: crypto.randomUUID(),
      moduleId,
      stepId,
      type,
      priority: 'medium',
      message: message.trim(),
      attachments,
      createdAt: new Date().toISOString(),
    }

    const existing: FeedbackItem[] = JSON.parse(
      localStorage.getItem('step-feedback') || '[]',
    )
    existing.push(item)
    localStorage.setItem('step-feedback', JSON.stringify(existing))

    toast.success('Feedback submitted — thank you!')
    resetForm()
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="w-full justify-center gap-2"
        onClick={() => setExpanded(true)}
      >
        <MessageSquare className="h-4 w-4" />
        Leave feedback on this step
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Step Feedback
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => resetForm()}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Type selector */}
      <div className="space-y-1.5">
        <Label htmlFor="feedback-type">Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as FeedbackType)}
        >
          <SelectTrigger id="feedback-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_TYPES.map((ft) => (
              <SelectItem key={ft.value} value={ft.value}>
                {ft.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="feedback-message">Message</Label>
        <Textarea
          id="feedback-message"
          placeholder="Describe your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label>Attachments</Label>
          <ul className="space-y-1">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  <span className="capitalize font-medium text-foreground">
                    {a.type}
                  </span>{' '}
                  — {a.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeAttachment(a.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Media buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
        >
          <Image className="h-4 w-4 mr-1.5" />
          Image
        </Button>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleAudioChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => audioInputRef.current?.click()}
        >
          <Mic className="h-4 w-4 mr-1.5" />
          Audio
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoomInput((v) => !v)}
        >
          <Link2 className="h-4 w-4 mr-1.5" />
          Loom Video
        </Button>
      </div>

      {/* Loom URL input */}
      {showLoomInput && (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="loom-url">Loom URL</Label>
            <Input
              id="loom-url"
              placeholder="https://www.loom.com/share/..."
              value={loomUrl}
              onChange={(e) => setLoomUrl(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={addLoomAttachment}>
            Add
          </Button>
        </div>
      )}

      {/* Submit */}
      <Button className="w-full gap-2" onClick={handleSubmit}>
        <Send className="h-4 w-4" />
        Submit Feedback
      </Button>
    </div>
  )
}
