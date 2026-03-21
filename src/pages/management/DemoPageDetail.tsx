import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  ExternalLink,
  Save,
  Upload,
  GripVertical,
  Type,
  FileText,
  MessageSquare,
  MousePointerClick,
  ImageIcon,
  Video,
  LayoutTemplate,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDemoPage, useDemoPages } from '@/hooks/useDemoPages'
import type { Section, DemoPage } from '@/hooks/useDemoPages'

type SectionType = Section['type']

const SECTION_TYPES: { value: SectionType; label: string; icon: typeof Type; description: string }[] = [
  { value: 'hero', label: 'Hero', icon: LayoutTemplate, description: 'Large title with subtitle' },
  { value: 'text', label: 'Text', icon: FileText, description: 'Rich text content' },
  { value: 'form', label: 'Form', icon: Type, description: 'Contact form' },
  { value: 'chat', label: 'Chat', icon: MessageSquare, description: 'Chat widget placeholder' },
  { value: 'cta', label: 'CTA', icon: MousePointerClick, description: 'Call-to-action button' },
  { value: 'image', label: 'Image', icon: ImageIcon, description: 'Display an image' },
  { value: 'video', label: 'Video', icon: Video, description: 'Embed a video' },
]

function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function createDefaultSection(type: SectionType, order: number): Section {
  return {
    id: generateSectionId(),
    type,
    title: '',
    content: '',
    settings: {},
    order,
  }
}

function getSectionIcon(type: SectionType) {
  const found = SECTION_TYPES.find((s) => s.value === type)
  return found ? found.icon : FileText
}

function DetailSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export default function DemoPageDetail() {
  const { clientId, pageId } = useParams<{ clientId: string; pageId: string }>()
  const navigate = useNavigate()
  const { page, loading, refetch } = useDemoPage(pageId ?? '')
  const { updatePage, togglePublish, uploadAsset } = useDemoPages(clientId ?? '')

  const [title, setTitle] = useState('')
  const [sections, setSections] = useState<Section[]>([])
  const [textAiWebhookUrl, setTextAiWebhookUrl] = useState('')
  const [voicePhoneNumber, setVoicePhoneNumber] = useState('')
  const [voicePhoneCountryCode, setVoicePhoneCountryCode] = useState('')
  const [phoneCallWebhookUrl, setPhoneCallWebhookUrl] = useState('')
  const [formAiWebhookUrl, setFormAiWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null)

  const loadPageData = useCallback((p: DemoPage) => {
    setTitle(p.title)
    setSections(p.sections ? [...p.sections].sort((a, b) => a.order - b.order) : [])
    setTextAiWebhookUrl(p.text_ai_webhook_url ?? '')
    setVoicePhoneNumber(p.voice_phone_number ?? '')
    setVoicePhoneCountryCode(p.voice_phone_country_code ?? '')
    setPhoneCallWebhookUrl(p.phone_call_webhook_url ?? '')
    setFormAiWebhookUrl(p.form_ai_webhook_url ?? '')
    setDirty(false)
  }, [])

  useEffect(() => {
    if (page) loadPageData(page)
  }, [page, loadPageData])

  const markDirty = () => setDirty(true)

  const handleSave = async () => {
    if (!pageId) return
    setSaving(true)
    try {
      const orderedSections = sections.map((s, i) => ({ ...s, order: i }))
      await updatePage(pageId, {
        title,
        sections: orderedSections,
        text_ai_webhook_url: textAiWebhookUrl || null,
        voice_phone_number: voicePhoneNumber || null,
        voice_phone_country_code: voicePhoneCountryCode || null,
        phone_call_webhook_url: phoneCallWebhookUrl || null,
        form_ai_webhook_url: formAiWebhookUrl || null,
      })
      toast.success('Page saved')
      setDirty(false)
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!page) return
    try {
      await togglePublish(page)
      toast.success(page.is_published ? 'Page unpublished' : 'Page published')
      await refetch()
    } catch {
      toast.error('Failed to toggle publish status')
    }
  }

  const addSection = (type: SectionType) => {
    const newSection = createDefaultSection(type, sections.length)
    setSections((prev) => [...prev, newSection])
    setAddSectionOpen(false)
    markDirty()
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    markDirty()
  }

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
    markDirty()
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return
    setSections((prev) => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[newIndex]
      updated[newIndex] = temp
      return updated
    })
    markDirty()
  }

  const handleImageUpload = async (sectionId: string, file: File) => {
    if (!pageId) return
    setUploadingSectionId(sectionId)
    try {
      const url = await uploadAsset(file, pageId)
      updateSection(sectionId, {
        settings: { ...sections.find((s) => s.id === sectionId)?.settings, imageUrl: url },
      })
      toast.success('Image uploaded')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploadingSectionId(null)
    }
  }

  const triggerFileUpload = (sectionId: string) => {
    setUploadingSectionId(sectionId)
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && uploadingSectionId) {
      handleImageUpload(uploadingSectionId, file)
    }
    e.target.value = ''
  }

  const copyPublicUrl = () => {
    if (!page) return
    const url = `${window.location.origin}/demo/${page.slug}`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const renderSectionFields = (section: Section) => {
    const settings = section.settings as Record<string, string | undefined>
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Headline</Label>
              <Input
                placeholder="Main headline"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Textarea
                placeholder="Supporting text"
                rows={2}
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Background Color</Label>
              <Input
                placeholder="#1a1a2e or transparent"
                value={settings.bgColor ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, bgColor: e.target.value } })
                }
              />
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Heading (optional)</Label>
              <Input
                placeholder="Section heading"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea
                placeholder="Write your content here..."
                rows={6}
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
          </div>
        )
      case 'form':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Form Title</Label>
              <Input
                placeholder="Get in Touch"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Fill in the form below..."
                rows={2}
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Submit Button Text</Label>
              <Input
                placeholder="Submit"
                value={settings.buttonText ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, buttonText: e.target.value } })
                }
              />
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Widget Title</Label>
              <Input
                placeholder="Chat with our AI"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Placeholder Message</Label>
              <Input
                placeholder="Type your message..."
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
          </div>
        )
      case 'cta':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Heading</Label>
              <Input
                placeholder="Ready to get started?"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Take the next step..."
                rows={2}
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Button Text</Label>
              <Input
                placeholder="Get Started"
                value={settings.buttonText ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, buttonText: e.target.value } })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Button URL</Label>
              <Input
                placeholder="https://..."
                value={settings.buttonUrl ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, buttonUrl: e.target.value } })
                }
              />
            </div>
          </div>
        )
      case 'image':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Caption (optional)</Label>
              <Input
                placeholder="Image caption"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Alt Text</Label>
              <Input
                placeholder="Describe the image"
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
              />
            </div>
            {settings.imageUrl ? (
              <div className="space-y-2">
                <img
                  src={settings.imageUrl}
                  alt={section.content || 'Uploaded image'}
                  className="max-h-48 rounded border object-cover"
                  loading="lazy"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileUpload(section.id)}
                  disabled={uploadingSectionId === section.id}
                >
                  <Upload className="h-4 w-4" />
                  {uploadingSectionId === section.id ? 'Uploading...' : 'Replace Image'}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => triggerFileUpload(section.id)}
                disabled={uploadingSectionId === section.id}
              >
                <Upload className="h-4 w-4" />
                {uploadingSectionId === section.id ? 'Uploading...' : 'Upload Image'}
              </Button>
            )}
            <div className="space-y-1">
              <Label>Or Image URL</Label>
              <Input
                placeholder="https://..."
                value={settings.imageUrl ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, imageUrl: e.target.value } })
                }
              />
            </div>
          </div>
        )
      case 'video':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title (optional)</Label>
              <Input
                placeholder="Video title"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Video Embed URL</Label>
              <Input
                placeholder="https://www.youtube.com/embed/..."
                value={settings.videoUrl ?? ''}
                onChange={(e) =>
                  updateSection(section.id, { settings: { ...section.settings, videoUrl: e.target.value } })
                }
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube or Vimeo embed URL.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) return <DetailSkeletons />

  if (!page) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">This demo page does not exist.</p>
        <Button variant="outline" onClick={() => navigate(`/c/${clientId}/management/demo-pages`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Demo Pages
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => navigate(`/c/${clientId}/management/demo-pages`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            className="text-xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
            value={title}
            onChange={(e) => { setTitle(e.target.value); markDirty() }}
            placeholder="Page title"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={page.is_published ? 'default' : 'outline'}>
            {page.is_published ? 'Published' : 'Draft'}
          </Badge>
          <Switch
            checked={page.is_published}
            onCheckedChange={handleTogglePublish}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/demo/${page.slug}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Slug */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Public URL:</span>
        <code className="bg-muted px-2 py-0.5 rounded text-xs">
          {window.location.origin}/demo/{page.slug}
        </code>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyPublicUrl}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sections Builder - left 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sections</h2>
            <Button size="sm" variant="outline" onClick={() => setAddSectionOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          {sections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">No sections yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add sections to build your demo page.
                </p>
                <Button className="mt-4" size="sm" onClick={() => setAddSectionOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            sections.map((section, index) => {
              const Icon = getSectionIcon(section.type)
              return (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {section.type}
                        </Badge>
                        {section.title && (
                          <span className="text-sm font-medium truncate max-w-48">
                            {section.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={index === 0}
                          onClick={() => moveSection(index, 'up')}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={index === sections.length - 1}
                          onClick={() => moveSection(index, 'down')}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>{renderSectionFields(section)}</CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Webhook Configuration - right col */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text AI Webhook URL</Label>
                <Input
                  placeholder="https://..."
                  value={textAiWebhookUrl}
                  onChange={(e) => { setTextAiWebhookUrl(e.target.value); markDirty() }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Voice Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+1"
                    className="w-20"
                    value={voicePhoneCountryCode}
                    onChange={(e) => { setVoicePhoneCountryCode(e.target.value); markDirty() }}
                  />
                  <Input
                    placeholder="555-123-4567"
                    value={voicePhoneNumber}
                    onChange={(e) => { setVoicePhoneNumber(e.target.value); markDirty() }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Call Webhook URL</Label>
                <Input
                  placeholder="https://..."
                  value={phoneCallWebhookUrl}
                  onChange={(e) => { setPhoneCallWebhookUrl(e.target.value); markDirty() }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Form AI Webhook URL</Label>
                <Input
                  placeholder="https://..."
                  value={formAiWebhookUrl}
                  onChange={(e) => { setFormAiWebhookUrl(e.target.value); markDirty() }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>Choose a section type to add to your page.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {SECTION_TYPES.map((st) => {
              const Icon = st.icon
              return (
                <button
                  key={st.value}
                  type="button"
                  className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                  onClick={() => addSection(st.value)}
                >
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{st.label}</div>
                    <div className="text-xs text-muted-foreground">{st.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSectionOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
