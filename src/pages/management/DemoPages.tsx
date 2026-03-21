import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Plus,
  FileText,
  ExternalLink,
  Pencil,
  Trash2,
  Globe,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDemoPages } from '@/hooks/useDemoPages'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function PageSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DemoPages() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { pages, loading, createPage, deletePage, togglePublish } = useDemoPages(clientId ?? '')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null)
  const [deletingPageTitle, setDeletingPageTitle] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setSlug(slugify(value))
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!slug.trim()) {
      toast.error('Slug is required')
      return
    }
    setSubmitting(true)
    try {
      const newPage = await createPage({ title: title.trim(), slug: slug.trim() })
      toast.success('Demo page created')
      setCreateDialogOpen(false)
      setTitle('')
      setSlug('')
      setSlugManuallyEdited(false)
      navigate(`/c/${clientId}/management/demo-pages/${newPage.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create page'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (page: Parameters<typeof togglePublish>[0]) => {
    try {
      await togglePublish(page)
      toast.success(page.is_published ? 'Page unpublished' : 'Page published')
    } catch {
      toast.error('Failed to toggle publish status')
    }
  }

  const confirmDelete = (pageId: string, pageTitle: string) => {
    setDeletingPageId(pageId)
    setDeletingPageTitle(pageTitle)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingPageId) return
    setSubmitting(true)
    try {
      await deletePage(deletingPageId)
      toast.success('Page deleted')
      setDeleteDialogOpen(false)
      setDeletingPageId(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete page'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const copyPublicUrl = (pageSlug: string) => {
    const url = `${window.location.origin}/demo/${pageSlug}`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demo Pages</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage public demo pages for your clients
          </p>
        </div>
        <Button onClick={() => { setTitle(''); setSlug(''); setSlugManuallyEdited(false); setCreateDialogOpen(true) }}>
          <Plus className="h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <PageSkeletons />
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No demo pages yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first demo page to showcase your services.
            </p>
            <Button
              className="mt-4"
              onClick={() => { setTitle(''); setSlug(''); setSlugManuallyEdited(false); setCreateDialogOpen(true) }}
            >
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{page.title}</h3>
                    <button
                      type="button"
                      className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => copyPublicUrl(page.slug)}
                    >
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate">/demo/{page.slug}</span>
                      <Copy className="h-3 w-3 shrink-0" />
                    </button>
                  </div>
                  <Badge variant={page.is_published ? 'default' : 'outline'}>
                    {page.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  {page.sections && page.sections.length > 0
                    ? `${page.sections.length} section${page.sections.length === 1 ? '' : 's'}`
                    : 'No sections'}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Created {new Date(page.created_at).toLocaleDateString()}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t mt-4">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={page.is_published}
                      onCheckedChange={() => handleTogglePublish(page)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {page.is_published ? 'Live' : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => navigate(`/c/${clientId}/management/demo-pages/${page.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(`/demo/${page.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(page.id, page.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Demo Page</DialogTitle>
            <DialogDescription>
              Set a title and URL slug for your new demo page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title">Title *</Label>
              <Input
                id="page-title"
                placeholder="e.g. AI Sales Demo"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">/demo/</span>
                <Input
                  id="page-slug"
                  placeholder="ai-sales-demo"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be the public URL for this demo page.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingPageTitle}&rdquo;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeletingPageId(null) }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
