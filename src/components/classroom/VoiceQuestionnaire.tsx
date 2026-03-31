import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Save, CheckCircle2, Image, Link2, X, Square, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface QuestionItem {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
}

const QUESTIONNAIRE_SECTIONS: Record<string, { title: string; description: string; questions: QuestionItem[] }> = {
  'voice-receptionist': {
    title: 'Voice Receptionist Questionnaire',
    description: 'Help us configure your AI receptionist to match your business perfectly.',
    questions: [
      { key: 'vr_greeting', label: 'Greeting & Persona', placeholder: 'e.g., "Thank you for calling [Business], this is Sarah, how can I help you today?"', type: 'textarea' },
      { key: 'vr_qualification', label: 'Qualification Questions', placeholder: 'What should the receptionist ask every caller? e.g., name, service needed, location, timeline — list in order', type: 'textarea' },
      { key: 'vr_tone', label: 'Voice Tone', placeholder: 'Select tone...', type: 'select', options: ['Professional & Friendly', 'Casual & Warm', 'Formal & Corporate', 'Energetic & Enthusiastic'] },
      { key: 'vr_booking_rules', label: 'Booking vs. Transfer Rules', placeholder: 'When should the agent book on calendar? When should it transfer to a real person? e.g., "Transfer upset callers, book routine appointments"', type: 'textarea' },
      { key: 'vr_services', label: 'Service Descriptions', placeholder: 'How do you describe your services when someone calls? Write it the way you would say it on the phone.', type: 'textarea' },
      { key: 'vr_phone_faqs', label: 'Common Phone Questions (Top 5-10)', placeholder: 'What questions do people ask when they call? Write them out with the answers you want the receptionist to give.', type: 'textarea' },
      { key: 'vr_call_flow', label: 'Ideal Call Flow', placeholder: 'Walk us through your ideal call from start to finish. What happens at each step? When does it end? What triggers escalation?', type: 'textarea' },
    ],
  },
  'db-reactivation': {
    title: 'Database Reactivation Questionnaire',
    description: 'Configure how your AI re-engages past leads and customers.',
    questions: [
      { key: 'dr_target', label: 'Which Leads to Target', placeholder: 'e.g., "Old leads from the last 6 months" or "Past customers from a specific service line" — be specific about the segment', type: 'textarea' },
      { key: 'dr_batch_size', label: 'Batch Size & Send Timing', placeholder: 'Select...', type: 'select', options: ['10 leads per day', '25 leads per day', '50 leads per day', '100 leads per day'] },
      { key: 'dr_send_time', label: 'What Time Should Messages Go Out?', placeholder: 'e.g., "9am weekdays" or "10am-2pm"', type: 'text' },
      { key: 'dr_personalization', label: 'Message Personalization', placeholder: 'What data do you have on these leads? Name, service they asked about, how long ago they inquired? Tell us so we can personalize.', type: 'textarea' },
      { key: 'dr_requalify', label: 'Re-qualification Questions', placeholder: 'e.g., "What is your timeline? Has your budget changed? Are you still looking for this service?"', type: 'textarea' },
      { key: 'dr_offer', label: 'Seasonal or Promotional Offer', placeholder: 'e.g., "20% off for returning customers" or "Free inspection this month" — a strong offer improves reactivation rates', type: 'text' },
    ],
  },
  'lead-followup': {
    title: 'Follow-Up Agent Questionnaire',
    description: 'Configure how your AI persistently follows up with unresponsive leads.',
    questions: [
      { key: 'lf_touchpoints', label: 'Number of Touchpoints', placeholder: 'Select...', type: 'select', options: ['5 messages over 7 days', '10 messages over 21 days (recommended)', '15 messages over 30 days', 'Custom — describe in voice note'] },
      { key: 'lf_timing', label: 'Timing Between Messages', placeholder: 'Select...', type: 'select', options: ['Every day', 'Every other day', 'Varies by stage (aggressive early, spaced later)', 'Custom schedule'] },
      { key: 'lf_channels', label: 'Channel Preferences', placeholder: 'Select...', type: 'select', options: ['SMS only', 'Email only', 'SMS + Email mix (recommended)', 'SMS + Email + Voice drops'] },
      { key: 'lf_tone', label: 'Tone & Brand Voice', placeholder: 'e.g., "Casual and friendly" or "Professional and direct" — how do you talk to your customers?', type: 'textarea' },
      { key: 'lf_exit', label: 'Exit Criteria', placeholder: 'What stops the sequence? e.g., "They reply not interested, they book an appointment, they unsubscribe"', type: 'textarea' },
      { key: 'lf_personalization', label: 'Message Personalization', placeholder: 'What details should the agent reference? Their name, the service they asked about, something from their initial conversation?', type: 'textarea' },
    ],
  },
  'appointment-reminders': {
    title: 'Appointment Setter Questionnaire',
    description: 'Configure how your AI books meetings and manages your calendar.',
    questions: [
      { key: 'as_types', label: 'Appointment Types', placeholder: 'e.g., "Discovery calls, demos, consultations, on-site estimates" — list all types you offer', type: 'textarea' },
      { key: 'as_availability', label: 'Available Time Slots', placeholder: 'e.g., "Mon-Fri 9am-5pm, no weekends" — when can people book?', type: 'text' },
      { key: 'as_buffer', label: 'Buffer Between Appointments', placeholder: 'Select...', type: 'select', options: ['No buffer needed', '15 minutes between appointments', '30 minutes between appointments', '1 hour between appointments'] },
      { key: 'as_calendar', label: 'Calendar Integration', placeholder: 'Select...', type: 'select', options: ['Google Calendar', 'GHL built-in calendar', 'Outlook / Microsoft Calendar', 'Other — describe in voice note'] },
      { key: 'as_confirmation', label: 'Confirmation Message Wording', placeholder: 'What should the confirmation text say? Include your business name and any details the client should know before the appointment.', type: 'textarea' },
      { key: 'as_reminders', label: 'Reminder Schedule', placeholder: 'Select...', type: 'select', options: ['24 hours + 1 hour before (recommended)', '24 hours before only', '48 hours + 24 hours + 1 hour before', 'Custom — describe in voice note'] },
      { key: 'as_reschedule', label: 'Rescheduling Rules', placeholder: 'Can leads reschedule on their own? How many times? How close to the appointment?', type: 'textarea' },
    ],
  },
  'website-chatbot': {
    title: 'Engagement Agent Questionnaire',
    description: 'Customize how your chatbot engages new leads when they first reach out.',
    questions: [
      { key: 'ea_greeting', label: 'Greeting Message', placeholder: 'e.g., "Hey there! Thanks for reaching out to [Business]. How can I help?"', type: 'textarea' },
      { key: 'ea_tone', label: 'Tone & Style', placeholder: 'Select tone...', type: 'select', options: ['Casual & Friendly', 'Professional & Buttoned-up', 'Warm & Conversational', 'Energetic & Enthusiastic'] },
      { key: 'ea_qualifying_questions', label: 'Qualifying Questions', placeholder: 'e.g., "What type of roof do you have?" or "What treatment are you interested in?" — list the questions that make sense for your business', type: 'textarea' },
      { key: 'ea_business_hours', label: 'Business Hours', placeholder: 'e.g., "Mon-Fri 8am-6pm, Sat 9am-1pm" — tells the agent when to book vs. promise follow-up', type: 'text' },
      { key: 'ea_escalation', label: 'Escalation Triggers', placeholder: 'e.g., "When someone says I need to talk to a manager" or "When a lead is ready to buy right now"', type: 'textarea' },
      { key: 'ea_knowledge', label: 'Key Knowledge Base Topics', placeholder: 'List the main topics the chatbot should know about — services, pricing, process, FAQs', type: 'textarea' },
      { key: 'ea_goal', label: 'Primary Conversation Goal', placeholder: 'Select...', type: 'select', options: ['Book an appointment', 'Capture contact info for follow-up', 'Answer questions and educate', 'Route to a team member'] },
    ],
  },
}

interface Attachment {
  id: string
  type: 'audio' | 'loom' | 'image'
  url: string
  name: string
}

interface VoiceQuestionnaireProps {
  moduleId: string
}

export function VoiceQuestionnaire({ moduleId }: VoiceQuestionnaireProps) {
  const section = QUESTIONNAIRE_SECTIONS[moduleId]
  if (!section) return null

  const storageKey = `questionnaire-${moduleId}`
  const attachmentKey = `questionnaire-attachments-${moduleId}`

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  })
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(attachmentKey) || '[]')
    } catch {
      return []
    }
  })
  const [saved, setSaved] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showLoomInput, setShowLoomInput] = useState(false)
  const [loomUrl, setLoomUrl] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSaved(false)
  }, [answers, attachments])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: 'audio',
          url,
          name: `Voice Note (${formatTime(recordingTime)})`,
        }
        setAttachments(prev => [...prev, attachment])
        stream.getTracks().forEach(track => track.stop())
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setRecording(true)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch {
      toast.error('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAttachments(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'audio',
      url,
      name: file.name,
    }])
    e.target.value = ''
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      type: 'image' as const,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const addLoom = () => {
    const trimmed = loomUrl.trim()
    if (!trimmed) return
    setAttachments(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'loom',
      url: trimmed,
      name: 'Loom Video',
    }])
    setLoomUrl('')
    setShowLoomInput(false)
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(answers))
    localStorage.setItem(attachmentKey, JSON.stringify(
      attachments.map(a => ({ ...a, url: a.type === 'loom' ? a.url : '(local file)' }))
    ))
    setSaved(true)
    toast.success('Questionnaire saved!')
  }

  const filledCount = section.questions.filter(q => answers[q.key]?.trim()).length

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filledCount} of {section.questions.length} answered
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {section.questions.map((q) => (
          <div key={q.key} className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              {q.label}
              {answers[q.key]?.trim() && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              )}
            </Label>
            {q.type === 'text' && (
              <Input
                value={answers[q.key] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                placeholder={q.placeholder}
              />
            )}
            {q.type === 'textarea' && (
              <textarea
                value={answers[q.key] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                placeholder={q.placeholder}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            )}
            {q.type === 'select' && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [q.key]: opt })}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                      answers[q.key] === opt
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Voice Note & Attachments Section */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Voice Note & Attachments</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record a 30-60 second voice note describing how you want this agent to work. You can also upload a Loom video or images.
          </p>
        </div>

        {/* Recording controls */}
        <div className="flex flex-wrap items-center gap-2">
          {recording ? (
            <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-2">
              <Square className="h-3.5 w-3.5" />
              Stop Recording ({formatTime(recordingTime)})
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={startRecording} className="gap-2">
              <Mic className="h-4 w-4" />
              Record Voice Note
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => audioInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Audio
          </Button>
          <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} className="gap-2">
            <Image className="h-4 w-4" />
            Upload Image
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLoomInput(!showLoomInput)} className="gap-2">
            <Link2 className="h-4 w-4" />
            Loom Video
          </Button>

          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Loom URL input */}
        {showLoomInput && (
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="loom-url" className="text-xs">Loom URL</Label>
              <Input
                id="loom-url"
                placeholder="https://www.loom.com/share/..."
                value={loomUrl}
                onChange={(e) => setLoomUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLoom()}
              />
            </div>
            <Button size="sm" onClick={addLoom} disabled={!loomUrl.trim()}>Add</Button>
          </div>
        )}

        {/* Recording indicator */}
        {recording && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <MicOff className="h-4 w-4 animate-pulse" />
            Recording in progress...
          </div>
        )}

        {/* Attachments list */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                {att.type === 'audio' && <Mic className="h-4 w-4 shrink-0 text-primary" />}
                {att.type === 'image' && <Image className="h-4 w-4 shrink-0 text-blue-500" />}
                {att.type === 'loom' && <Link2 className="h-4 w-4 shrink-0 text-purple-500" />}
                <span className="text-sm flex-1 truncate">{att.name}</span>
                {att.type === 'audio' && att.url !== '(local file)' && (
                  <audio src={att.url} controls className="h-8 max-w-[200px]" />
                )}
                {att.type === 'image' && att.url !== '(local file)' && (
                  <img src={att.url} alt={att.name} className="h-10 w-10 rounded object-cover" />
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleSave} size="sm" className="gap-2">
        {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Saved!' : 'Save Questionnaire'}
      </Button>
    </div>
  )
}
