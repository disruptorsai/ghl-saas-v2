import { useState, useEffect } from 'react'
import { Mic, Save, CheckCircle2 } from 'lucide-react'
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
      { key: 'vr_business_name', label: 'Business Name (as AI should say it)', placeholder: 'e.g., "Smith Plumbing and Heating"', type: 'text' },
      { key: 'vr_greeting', label: 'Preferred Greeting', placeholder: 'e.g., "Thank you for calling Smith Plumbing! How can I help you today?"', type: 'text' },
      { key: 'vr_tone', label: 'Desired Tone', placeholder: 'Select tone...', type: 'select', options: ['Professional & Friendly', 'Casual & Warm', 'Formal & Corporate', 'Energetic & Enthusiastic'] },
      { key: 'vr_services_summary', label: 'Quick Summary of Services', placeholder: 'List your main services so the AI can discuss them...', type: 'textarea' },
      { key: 'vr_booking_preference', label: 'Appointment Booking Preference', placeholder: 'Select preference...', type: 'select', options: ['Book directly on calendar', 'Collect info and have team call back', 'Transfer to live person for booking', 'Mix — book simple, escalate complex'] },
      { key: 'vr_after_hours', label: 'After-Hours Handling', placeholder: 'Select...', type: 'select', options: ['Take a message and promise next-day callback', 'Offer emergency service option', 'Book next available appointment', 'Provide basic info only'] },
      { key: 'vr_transfer_number', label: 'Transfer Number (for live escalation)', placeholder: '(555) 123-4567', type: 'text' },
      { key: 'vr_no_discuss', label: 'Topics AI Should NOT Discuss', placeholder: 'e.g., "Never discuss competitor pricing or give exact quotes over the phone"', type: 'textarea' },
    ],
  },
  'db-reactivation': {
    title: 'Database Reactivation Questionnaire',
    description: 'Configure how your AI re-engages past customers.',
    questions: [
      { key: 'dr_offer', label: 'Reactivation Offer', placeholder: 'e.g., "20% off for returning customers" or "Free inspection"', type: 'text' },
      { key: 'dr_tone', label: 'Message Tone', placeholder: 'Select tone...', type: 'select', options: ['Friendly check-in', 'Exclusive offer', 'Seasonal reminder', 'We miss you'] },
      { key: 'dr_frequency', label: 'How Often to Reach Out', placeholder: 'Select...', type: 'select', options: ['One-time campaign', 'Monthly', 'Quarterly', 'Seasonally'] },
      { key: 'dr_exclude', label: 'Who to Exclude', placeholder: 'e.g., "Anyone who contacted us in the last 30 days"', type: 'text' },
    ],
  },
  'lead-followup': {
    title: 'Lead Follow-up Questionnaire',
    description: 'Define how your AI follows up with new leads.',
    questions: [
      { key: 'lf_speed', label: 'First Response Time Goal', placeholder: 'Select...', type: 'select', options: ['Under 1 minute (speed to lead)', 'Within 5 minutes', 'Within 15 minutes', 'Within 1 hour'] },
      { key: 'lf_followup_count', label: 'Number of Follow-up Attempts', placeholder: 'Select...', type: 'select', options: ['3 attempts over 3 days', '5 attempts over 7 days', '7 attempts over 14 days', 'Until they respond or opt out'] },
      { key: 'lf_qualifier', label: 'Lead Qualification Questions', placeholder: 'e.g., "What service do you need? When do you need it? What\'s your budget?"', type: 'textarea' },
      { key: 'lf_goal', label: 'Follow-up Goal', placeholder: 'Select...', type: 'select', options: ['Book an appointment', 'Get them on the phone', 'Collect more info for a quote', 'Direct to website'] },
    ],
  },
}

interface VoiceQuestionnaireProps {
  moduleId: string
}

export function VoiceQuestionnaire({ moduleId }: VoiceQuestionnaireProps) {
  const section = QUESTIONNAIRE_SECTIONS[moduleId]
  if (!section) return null

  const storageKey = `questionnaire-${moduleId}`
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [answers])

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(answers))
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

      <Button onClick={handleSave} size="sm" className="gap-2">
        {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Saved!' : 'Save Questionnaire'}
      </Button>
    </div>
  )
}
