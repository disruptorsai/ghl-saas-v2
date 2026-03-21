import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquare, Send, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDemoPageBySlug } from '@/hooks/useDemoPages'
import type { Section } from '@/hooks/useDemoPages'

function PublicSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-500 text-lg">This demo page was not found or is not published.</p>
        <Button asChild variant="outline">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

function HeroSection({ section }: { section: Section }) {
  const settings = section.settings as Record<string, string | undefined>
  const bgColor = settings.bgColor || '#1a1a2e'
  const isLight = bgColor === 'transparent' || bgColor === '#fff' || bgColor === '#ffffff' || bgColor === 'white'
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h1 className={`text-4xl font-bold md:text-5xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {section.title || 'Hero Title'}
        </h1>
        {section.content && (
          <p className={`mt-4 text-lg md:text-xl ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
            {section.content}
          </p>
        )}
      </div>
    </section>
  )
}

function TextSection({ section }: { section: Section }) {
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
        )}
        {section.content && (
          <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
            {section.content}
          </div>
        )}
      </div>
    </section>
  )
}

function FormSection({ section, webhookUrl }: { section: Section; webhookUrl?: string | null }) {
  const settings = section.settings as Record<string, string | undefined>
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            form_title: section.title || 'Contact Form',
            submitted_at: new Date().toISOString(),
          }),
        })
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
      }
      toast.success('Form submitted successfully!')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error('Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="mx-auto max-w-lg">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{section.title}</h2>
        )}
        {section.content && (
          <p className="text-gray-600 text-center mb-6">{section.content}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-gray-700">Name</Label>
            <Input
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-700">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-700">Phone</Label>
            <Input
              type="tel"
              placeholder="555-123-4567"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-700">Message</Label>
            <Textarea
              placeholder="How can we help?"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? 'Sending...' : (settings.buttonText || 'Submit')}
          </Button>
        </form>
      </div>
    </section>
  )
}

function ChatSection({ section }: { section: Section }) {
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-lg">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{section.title}</h2>
        )}
        <div className="border rounded-lg p-8 bg-gray-50 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">Chat Widget</h3>
          <p className="mt-1 text-sm text-gray-500">
            {section.content || 'Chat functionality will be embedded here.'}
          </p>
        </div>
      </div>
    </section>
  )
}

function CTASection({ section }: { section: Section }) {
  const settings = section.settings as Record<string, string | undefined>
  return (
    <section className="py-16 px-4 bg-primary text-white">
      <div className="mx-auto max-w-2xl text-center">
        {section.title && (
          <h2 className="text-3xl font-bold mb-3">{section.title}</h2>
        )}
        {section.content && (
          <p className="text-lg text-white/80 mb-6">{section.content}</p>
        )}
        {settings.buttonUrl ? (
          <a
            href={settings.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-white text-primary px-8 py-3 font-medium hover:bg-white/90 transition-colors"
          >
            {settings.buttonText || 'Get Started'}
          </a>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-white text-primary px-8 py-3 font-medium hover:bg-white/90 transition-colors"
          >
            {settings.buttonText || 'Get Started'}
          </button>
        )}
      </div>
    </section>
  )
}

function ImageSection({ section }: { section: Section }) {
  const settings = section.settings as Record<string, string | undefined>
  const imageUrl = settings.imageUrl
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={section.content || section.title || 'Demo image'}
            className="w-full rounded-lg shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-400">No image set</p>
          </div>
        )}
        {section.title && (
          <p className="mt-3 text-center text-sm text-gray-500">{section.title}</p>
        )}
      </div>
    </section>
  )
}

function VideoSection({ section }: { section: Section }) {
  const settings = section.settings as Record<string, string | undefined>
  const videoUrl = settings.videoUrl
  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{section.title}</h2>
        )}
        {videoUrl ? (
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={section.title || 'Video'}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-400">No video URL set</p>
          </div>
        )}
      </div>
    </section>
  )
}

function renderSection(section: Section, webhookUrl?: string | null) {
  switch (section.type) {
    case 'hero':
      return <HeroSection key={section.id} section={section} />
    case 'text':
      return <TextSection key={section.id} section={section} />
    case 'form':
      return <FormSection key={section.id} section={section} webhookUrl={webhookUrl} />
    case 'chat':
      return <ChatSection key={section.id} section={section} />
    case 'cta':
      return <CTASection key={section.id} section={section} />
    case 'image':
      return <ImageSection key={section.id} section={section} />
    case 'video':
      return <VideoSection key={section.id} section={section} />
    default:
      return null
  }
}

export default function DemoPublic() {
  const { slug } = useParams<{ slug: string }>()
  const { page, loading, notFound } = useDemoPageBySlug(slug ?? '')

  if (loading) return <PublicSkeleton />
  if (notFound || !page) return <NotFoundPage />

  const sections = (page.published_sections ?? page.sections ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)

  const voicePhone = page.voice_phone_number
  const countryCode = page.voice_phone_country_code || ''
  const fullPhone = countryCode ? `${countryCode}${voicePhone}` : voicePhone

  return (
    <div className="min-h-screen bg-white">
      {sections.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
            <p className="mt-2 text-gray-500">This page has no content yet.</p>
          </div>
        </div>
      ) : (
        sections.map((s) => renderSection(s, page.form_ai_webhook_url))
      )}

      {/* Floating Call Us button when voice phone is configured */}
      {voicePhone && (
        <a
          href={`tel:${fullPhone}`}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-white shadow-lg hover:bg-green-700 transition-colors"
        >
          <Phone className="h-5 w-5" />
          <span className="font-medium">Call Us</span>
        </a>
      )}
    </div>
  )
}
