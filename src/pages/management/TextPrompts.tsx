import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CredentialGate } from '@/components/CredentialGate'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  MessageSquare,
  UserCircle,
  Bot,
  CalendarCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PromptPlayground } from '@/components/PromptPlayground'
import { usePrompts, type Prompt, type PromptCategory } from '@/hooks/usePrompts'
import { useCredentials } from '@/hooks/useCredentials'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { firePromptWebhook } from '@/lib/webhooks'

const CATEGORY_ICONS: Record<PromptCategory, React.ReactNode> = {
  persona: <UserCircle className="h-5 w-5" />,
  main_agent: <Bot className="h-5 w-5" />,
  booking: <CalendarCheck className="h-5 w-5" />,
}

function PromptSkeletons() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function TextPrompts() {
  const navigate = useNavigate()
  const { grouped, loading, updatePrompt } = usePrompts('text')
  const { credentials } = useCredentials()
  const { clientId } = useClientSupabase()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [formName, setFormName] = useState('')
  const [formContent, setFormContent] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setFormName(prompt.prompt_name ?? '')
    setFormContent(prompt.content ?? '')
    setEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!editingPrompt) return
    setSubmitting(true)
    try {
      const hasContent = !!formContent.trim()
      await updatePrompt(editingPrompt.id, {
        prompt_name: formName.trim() || undefined,
        content: formContent.trim() || undefined,
        is_active: hasContent,
      })

      const webhookUrl = credentials?.prompt_webhook_url
      if (webhookUrl && clientId) {
        void firePromptWebhook(webhookUrl, {
          id: editingPrompt.id,
          prompt_name: formName.trim() || null,
          content: formContent.trim() || null,
          prompt_type: 'text',
          client_id: clientId,
        }).catch(() => {})
      }

      toast.success('Prompt updated')
      setEditDialogOpen(false)
      setEditingPrompt(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update prompt'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('..')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Text Prompts</h1>
          <p className="text-sm text-muted-foreground">
            Manage text prompts for your AI agents
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PromptSkeletons />
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No text prompts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Run the migration SQL to create prompt slots.
            </p>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              {CATEGORY_ICONS[group.category]}
              <h2 className="text-lg font-semibold">{group.label}</h2>
            </div>

            {/* Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.prompts.map((prompt) => {
                const isExpanded = expandedIds.has(prompt.id)
                return (
                  <Card key={prompt.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge
                              variant={prompt.is_active ? 'default' : 'secondary'}
                              className={prompt.is_active
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : ''}
                            >
                              {prompt.is_active ? 'Active' : 'Not Active'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-sm text-muted-foreground">
                              Prompt-{prompt.id}
                            </span>
                            <span className="text-muted-foreground">-</span>
                            <span className="font-semibold">
                              {prompt.prompt_name || '(unnamed)'}
                            </span>
                          </div>
                          {prompt.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {prompt.content
                                ? prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '...' : '')
                                : prompt.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleExpand(prompt.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(prompt)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 rounded-md border bg-muted/50 p-4">
                          {prompt.content ? (
                            <pre className="whitespace-pre-wrap text-sm font-mono">
                              {prompt.content}
                            </pre>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Default prompt has been configured. Click Edit to customize or save it.
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Edit Dialog — split view with playground */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Text Prompt</DialogTitle>
            <DialogDescription>Update the prompt and test it with an AI model.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-name">Prompt Name</Label>
                <Input
                  id="edit-prompt-name"
                  placeholder="e.g. Main Text Agent"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-content">Content</Label>
                <Textarea
                  id="edit-prompt-content"
                  placeholder="Enter the prompt content..."
                  rows={16}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEditingPrompt(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Right: Playground */}
            <div className="border rounded-lg p-4 flex flex-col min-h-[400px] md:min-h-0 md:h-[500px]">
              <h3 className="text-sm font-semibold mb-3">Playground</h3>
              <div className="flex-1 min-h-0">
                <PromptPlayground systemPrompt={formContent} onApplyPrompt={setFormContent} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </CredentialGate>
  )
}
