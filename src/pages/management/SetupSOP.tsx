import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Key,
  MessageSquare,
  Phone,
  FileText,
  BookOpen,
  Rocket,
  Megaphone,
  BarChart3,
  Plug,
  Globe,
  Circle,
  ExternalLink,
  PlayCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SOPStep {
  title: string
  what: string
  why: string
  steps: string[]
  tips?: string[]
  videoPlaceholder?: boolean
}

interface SOPSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  navLink: string
  steps: SOPStep[]
}

const SOP_SECTIONS: SOPSection[] = [
  {
    id: 'credentials',
    title: 'Step 1: Set Up Your API Keys',
    icon: <Key className="h-5 w-5" />,
    description: 'Connect your AI providers and integrations so everything can talk to each other.',
    navLink: 'credentials',
    steps: [
      {
        title: 'Get your OpenRouter API Key',
        what: 'OpenRouter lets you access hundreds of AI models (GPT-4, Claude, Llama, etc.) through one API key.',
        why: 'Your text and voice AI reps use this to generate responses. Without it, no AI conversations happen.',
        steps: [
          'Go to openrouter.ai and create an account',
          'Navigate to "Keys" in your dashboard',
          'Click "Create Key" and copy the key',
          'Come back here, go to Credentials > AI APIs tab',
          'Paste your OpenRouter API key and save',
        ],
        tips: [
          'Start with a small credit amount ($5-10) to test',
          'OpenRouter charges per token — you only pay for what you use',
        ],
        videoPlaceholder: true,
      },
      {
        title: 'Get your OpenAI API Key (optional)',
        what: 'Direct OpenAI access for embeddings and GPT models.',
        why: 'Used for knowledge base embeddings. OpenRouter can also handle chat, so this is optional for chat but needed for knowledge base.',
        steps: [
          'Go to platform.openai.com',
          'Navigate to API Keys',
          'Create a new secret key',
          'Paste it in Credentials > AI APIs > OpenAI API Key',
        ],
      },
      {
        title: 'Set up GoHighLevel (GHL) credentials',
        what: 'GHL is your CRM — it manages contacts, calendars, and messaging.',
        why: 'Your AI reps need GHL to send messages, book appointments, and update contact records.',
        steps: [
          'Log in to your GHL sub-account',
          'Go to Settings > Business Profile > Copy your Location ID',
          'Go to Settings > API Keys > Create a new API key',
          'Get your Calendar ID from Calendars section',
          'Get your Assignee ID (the user who owns appointments)',
          'Paste all four values in Credentials > GoHighLevel tab',
        ],
        tips: [
          'The Location ID is in the URL when you are inside a sub-account',
          'Calendar ID is visible when you click on a calendar in GHL',
        ],
        videoPlaceholder: true,
      },
      {
        title: 'Set up Retell AI credentials (for voice)',
        what: 'Retell AI powers your voice AI agent — it handles phone calls with natural-sounding AI.',
        why: 'Without Retell, voice AI reps cannot make or receive calls.',
        steps: [
          'Sign up at retellai.com',
          'Go to your dashboard and copy your API key',
          'Create an inbound agent and copy its Agent ID',
          'Create an outbound agent and copy its Agent ID',
          'Paste everything in Credentials > Retell AI tab',
        ],
        videoPlaceholder: true,
      },
    ],
  },
  {
    id: 'webhooks',
    title: 'Step 2: Configure Webhooks',
    icon: <Plug className="h-5 w-5" />,
    description: 'Webhooks connect this platform to n8n (your automation engine). They tell n8n when something happens.',
    navLink: 'credentials',
    steps: [
      {
        title: 'Understand what webhooks do',
        what: 'A webhook is a URL that receives data when an event happens. Think of it like a doorbell — when someone presses it, your automation (n8n) wakes up and does something.',
        why: 'Every AI action (sending a message, updating a prompt, adding to knowledge base) triggers a webhook that tells n8n to process it.',
        steps: [
          'You will get webhook URLs from your n8n workflows (Step 3)',
          'Each webhook handles a specific task:',
          '  - Prompt Webhook: syncs prompt changes to n8n',
          '  - KB Add Webhook: sends new knowledge base entries for embedding',
          '  - KB Delete Webhook: removes knowledge base entries',
          '  - Text Engine Webhook: handles text AI conversations',
          '  - Campaign Webhook: processes database reactivation campaigns',
        ],
        tips: [
          'Don\'t worry about setting these yet — you\'ll get the URLs when you import n8n workflows',
          'Each webhook URL is unique to your n8n instance',
        ],
      },
      {
        title: 'Import n8n workflows',
        what: 'n8n is the automation engine that processes all AI actions behind the scenes.',
        why: 'Without n8n workflows, webhooks have nowhere to go. The workflows contain all the logic for AI conversations, campaign processing, and knowledge base management.',
        steps: [
          'Go to your n8n instance (ask your admin for the URL)',
          'Import each workflow template from the Workflow Imports page',
          'Activate each workflow in n8n',
          'Copy the webhook URLs from each workflow',
          'Paste them in Credentials > Webhooks tab',
        ],
        videoPlaceholder: true,
      },
    ],
  },
  {
    id: 'prompts',
    title: 'Step 3: Create Your Prompts',
    icon: <FileText className="h-5 w-5" />,
    description: 'Prompts tell your AI reps how to behave, what to say, and how to handle different situations.',
    navLink: 'prompts',
    steps: [
      {
        title: 'Set up your Bot Persona',
        what: 'The persona prompt defines your AI rep\'s personality — how it talks, its tone, what it knows about your business.',
        why: 'This is the foundation. Every message your AI sends is shaped by this prompt. A good persona = natural, on-brand conversations.',
        steps: [
          'Go to Prompts > Text Prompts',
          'Click Edit on the "Bot Persona" prompt',
          'Write your AI\'s personality:',
          '  - Who is it? (name, role)',
          '  - How does it talk? (casual, professional, fun)',
          '  - What business does it represent?',
          '  - What should it NEVER do?',
          'Use the Playground on the right side to test — ask it questions and see if the responses feel right',
          'Click "Apply to prompt" when the AI editor suggests improvements',
          'Hit Save when you\'re happy',
        ],
        tips: [
          'Keep it specific. "Be friendly" is vague. "Be professional but fun, use casual language, never use emojis" is clear.',
          'Include your business name, services, and pricing so the AI can answer questions',
          'Test with tricky questions like "what are your prices?" or "can I speak to a human?"',
        ],
        videoPlaceholder: true,
      },
      {
        title: 'Set up your Main Agent prompts',
        what: 'These prompts handle the core conversation flow — greeting leads, qualifying them, and guiding them toward booking.',
        why: 'The main agent does the heavy lifting. It follows your sales process and handles objections.',
        steps: [
          'Go to Prompts > Text Prompts',
          'Edit each Main Agent prompt',
          'Define conversation stages:',
          '  - How to greet a new lead',
          '  - What qualifying questions to ask',
          '  - How to handle common objections',
          '  - When and how to offer booking',
          'Test each prompt in the Playground',
          'Save when ready',
        ],
      },
      {
        title: 'Set up Booking prompts',
        what: 'These prompts handle the appointment booking flow — when a lead is ready, the AI guides them to pick a time.',
        why: 'The whole point of the AI rep is to book meetings. This prompt needs to be smooth and clear.',
        steps: [
          'Edit the Booking prompt',
          'Define how the AI should:',
          '  - Transition to booking (e.g. "great, let me find a time for you")',
          '  - Present available times',
          '  - Confirm the booking',
          '  - Handle if no times work',
          'Save when ready',
        ],
      },
      {
        title: 'Set up Voice Prompts (if using voice AI)',
        what: 'Voice prompts are similar to text prompts but optimized for spoken conversation.',
        why: 'People talk differently than they text. Voice prompts need to account for natural speech patterns.',
        steps: [
          'Go to Prompts > Voice Prompts',
          'Set up Voice Persona, Voice Agent, and Booking prompts',
          'Keep sentences shorter — people can\'t re-read spoken words',
          'Avoid complex formatting (lists, bullet points) — it sounds weird spoken out loud',
          'Test in the Playground to check the flow',
        ],
        tips: [
          'Read your prompts out loud — if it sounds awkward, rewrite it',
          'Use conversational language: "Sure thing!" not "Certainly, I can assist you with that."',
        ],
      },
    ],
  },
  {
    id: 'knowledge-base',
    title: 'Step 4: Build Your Knowledge Base',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'The knowledge base gives your AI rep factual information about your business that it can reference during conversations.',
    navLink: 'knowledge-base',
    steps: [
      {
        title: 'Add your business information',
        what: 'Knowledge base entries are chunks of information the AI can search through when answering questions.',
        why: 'Without a knowledge base, the AI can only rely on its prompts. With one, it can answer specific questions about your services, pricing, FAQs, etc.',
        steps: [
          'Go to Knowledge Base',
          'Click "Add Entry"',
          'Add entries for:',
          '  - Your services and what they include',
          '  - Pricing (if you want the AI to share it)',
          '  - Frequently asked questions',
          '  - Business hours and location',
          '  - Your team and their roles',
          '  - Policies (refund, cancellation, etc.)',
          'Use clear, simple language — the AI reads this literally',
          'Add relevant tags to each entry for better search',
        ],
        tips: [
          'One topic per entry works best. Don\'t cram everything into one giant entry.',
          'Write as if you\'re explaining to a new employee',
          'If there\'s info you DON\'T want the AI to share, don\'t put it in the KB',
        ],
        videoPlaceholder: true,
      },
    ],
  },
  {
    id: 'text-ai',
    title: 'Step 5: Configure Text AI Rep',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Set up how your text-based AI rep connects to GHL for SMS/chat conversations.',
    navLink: 'text-ai-rep/configuration',
    steps: [
      {
        title: 'Configure the text engine',
        what: 'The text AI rep handles SMS and chat conversations through GHL.',
        why: 'This connects your prompts + knowledge base to actual conversations with real leads.',
        steps: [
          'Go to Text AI Rep > Configuration',
          'Make sure your Text Engine Webhook is set (from Step 2)',
          'Verify your GHL credentials are connected',
          'The text AI rep uses:',
          '  - Your Bot Persona for personality',
          '  - Your Main Agent prompts for conversation flow',
          '  - Your Knowledge Base for factual answers',
          '  - GHL for sending/receiving messages',
        ],
      },
    ],
  },
  {
    id: 'voice-ai',
    title: 'Step 6: Configure Voice AI Rep',
    icon: <Phone className="h-5 w-5" />,
    description: 'Set up phone-based AI conversations through Retell AI.',
    navLink: 'voice-ai-rep/configuration',
    steps: [
      {
        title: 'Configure voice settings',
        what: 'The voice AI rep handles inbound and outbound phone calls.',
        why: 'Voice AI can call leads or answer incoming calls, qualifying them and booking appointments automatically.',
        steps: [
          'Go to Voice AI Rep > Configuration',
          'Make sure Retell AI credentials are set (from Step 1)',
          'Configure your inbound agent (answers calls)',
          'Configure your outbound agent (makes calls)',
          'Set up phone numbers in Retell dashboard',
          'Test with a real phone call',
        ],
        tips: [
          'Start with inbound only — it\'s lower risk than outbound calling',
          'Listen to test calls and adjust voice prompts based on how they sound',
        ],
      },
    ],
  },
  {
    id: 'campaigns',
    title: 'Step 7: Launch Your First Campaign',
    icon: <Megaphone className="h-5 w-5" />,
    description: 'Database reactivation campaigns reach out to your existing leads and re-engage them.',
    navLink: 'campaigns',
    steps: [
      {
        title: 'Create a campaign',
        what: 'A campaign takes a CSV of leads, uploads them, and sends AI-powered messages to re-engage them.',
        why: 'This is where the ROI happens. Old leads in your database get reactivated by the AI, leading to new bookings.',
        steps: [
          'Go to Campaigns',
          'Click "New Campaign"',
          'Give it a name (e.g. "March 2026 Reactivation")',
          'Upload your CSV file with lead data',
          '  - Required columns: name, email, phone',
          '  - Extra columns go into the "data" field',
          'Review the imported leads',
          'Click "Start Campaign" to begin',
          'The AI will message each lead through GHL',
          'Monitor responses in the campaign detail view',
        ],
        tips: [
          'Start small — test with 10-20 leads first to make sure messages sound right',
          'Clean your CSV: remove duplicates, invalid phone numbers, and opted-out contacts',
          'Check your GHL messaging limits before sending to large lists',
        ],
        videoPlaceholder: true,
      },
    ],
  },
  {
    id: 'deploy',
    title: 'Step 8: Deploy and Go Live',
    icon: <Rocket className="h-5 w-5" />,
    description: 'Final checks before your AI reps start handling real conversations.',
    navLink: 'deploy-ai-reps',
    steps: [
      {
        title: 'Pre-launch checklist',
        what: 'Make sure everything is connected and working before going live.',
        why: 'A broken AI rep is worse than no AI rep. Take 10 minutes to verify everything.',
        steps: [
          'Go to Deploy AI Reps to see your readiness status',
          'Verify all green checks:',
          '  - API keys configured',
          '  - Webhooks connected',
          '  - Prompts saved',
          '  - Knowledge base has entries',
          '  - GHL integration working',
          'Test text AI: send yourself a test message through GHL',
          'Test voice AI: call your Retell phone number',
          'Check Debug AI Reps for any errors',
        ],
        tips: [
          'Have a real person test it — they\'ll ask questions you didn\'t think of',
          'Keep the Debug page open during your first campaign to catch issues early',
        ],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Step 9: Monitor and Optimize',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Track how your AI reps are performing and make improvements over time.',
    navLink: 'analytics',
    steps: [
      {
        title: 'Track your metrics',
        what: 'Analytics show you how many conversations are happening, how many lead to bookings, and where leads drop off.',
        why: 'You can\'t improve what you don\'t measure. Analytics tell you which prompts need tweaking.',
        steps: [
          'Check the Dashboard daily for a quick overview',
          'Use Chat Analytics for detailed text conversation metrics',
          'Use Voice AI Dashboard for call metrics',
          'Look for patterns:',
          '  - Are leads dropping off at a specific point?',
          '  - Are common questions going unanswered?',
          '  - Is the booking rate where you want it?',
          'Update prompts and knowledge base based on what you learn',
        ],
        tips: [
          'Check analytics weekly at minimum',
          'If a question comes up often, add it to the Knowledge Base',
          'If leads are dropping off, revisit your Main Agent prompts',
        ],
      },
    ],
  },
  {
    id: 'demo-pages',
    title: 'Step 10: Create Demo Pages (Optional)',
    icon: <Globe className="h-5 w-5" />,
    description: 'Build public-facing demo pages to showcase your AI reps to clients or prospects.',
    navLink: 'demo-pages',
    steps: [
      {
        title: 'Build a demo page',
        what: 'Demo pages are public web pages you can share to show off your AI in action.',
        why: 'Great for selling your AI service to new clients — they can see it work before they buy.',
        steps: [
          'Go to Demo Pages',
          'Click "New Page" and give it a title + URL slug',
          'Add sections: hero banner, text content, chat widget, CTA buttons',
          'Configure webhooks so the demo chat actually connects to your AI',
          'Preview the page to make sure it looks good',
          'Publish it — the public URL will be: yourdomain.com/demo/your-slug',
          'Share the link with prospects',
        ],
      },
    ],
  },
]

export default function SetupSOP() {
  const navigate = useNavigate()
  const { clientId } = useParams<{ clientId: string }>()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([SOP_SECTIONS[0].id])
  )
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleStep = (key: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Setup Guide (SOPs)</h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step instructions to get your AI reps up and running.
          Follow these in order — each step builds on the previous one.
        </p>
      </div>

      {/* Quick nav */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold mb-3">Jump to a section:</h2>
          <div className="flex flex-wrap gap-2">
            {SOP_SECTIONS.map((section, i) => (
              <Button
                key={section.id}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setExpandedSections((prev) => new Set(prev).add(section.id))
                  document.getElementById(`sop-${section.id}`)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {i + 1}. {section.title.replace(/^Step \d+: /, '')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {SOP_SECTIONS.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id)

          return (
            <Card key={section.id} id={`sop-${section.id}`}>
              <CardContent className="pt-6">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{section.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/c/${clientId}/management/${section.navLink}`)
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Go
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 ml-[52px]">
                    {section.steps.map((step, stepIndex) => {
                      const stepKey = `${section.id}-${stepIndex}`
                      const isStepExpanded = expandedSteps.has(stepKey)

                      return (
                        <div key={stepKey} className="border rounded-lg">
                          <button
                            onClick={() => toggleStep(stepKey)}
                            className="flex items-center gap-3 w-full text-left p-3"
                          >
                            <div className="relative flex-shrink-0">
                              <Circle className="h-6 w-6 text-muted-foreground/40" />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                {sectionIndex + 1}.{stepIndex + 1}
                              </span>
                            </div>
                            <span className="font-medium text-sm flex-1">{step.title}</span>
                            {step.videoPlaceholder && (
                              <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                                <PlayCircle className="h-3 w-3" />
                                Video coming soon
                              </Badge>
                            )}
                            {isStepExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                          </button>

                          {isStepExpanded && (
                            <div className="px-3 pb-4 space-y-3 ml-9">
                              {/* What */}
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">What is this?</h4>
                                <p className="text-sm">{step.what}</p>
                              </div>

                              {/* Why */}
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why does it matter?</h4>
                                <p className="text-sm">{step.why}</p>
                              </div>

                              {/* How */}
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">How to do it</h4>
                                <ol className="space-y-1.5">
                                  {step.steps.map((instruction, i) => {
                                    const isIndented = instruction.startsWith('  - ')
                                    return (
                                      <li
                                        key={i}
                                        className={`text-sm flex gap-2 ${isIndented ? 'ml-6' : ''}`}
                                      >
                                        {isIndented ? (
                                          <>
                                            <span className="text-muted-foreground shrink-0">-</span>
                                            <span>{instruction.replace('  - ', '')}</span>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-muted-foreground font-mono text-xs shrink-0 mt-0.5 w-5 text-right">
                                              {i + 1}.
                                            </span>
                                            <span>{instruction}</span>
                                          </>
                                        )}
                                      </li>
                                    )
                                  })}
                                </ol>
                              </div>

                              {/* Tips */}
                              {step.tips && step.tips.length > 0 && (
                                <div className="rounded-md bg-primary/5 border border-primary/10 p-3">
                                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Tips</h4>
                                  <ul className="space-y-1">
                                    {step.tips.map((tip, i) => (
                                      <li key={i} className="text-sm flex gap-2">
                                        <span className="text-primary shrink-0">*</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Video placeholder */}
                              {step.videoPlaceholder && (
                                <div className="rounded-md border border-dashed border-muted-foreground/30 p-6 flex flex-col items-center justify-center text-center gap-2">
                                  <PlayCircle className="h-8 w-8 text-muted-foreground/40" />
                                  <p className="text-xs text-muted-foreground">
                                    Video walkthrough coming soon
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
