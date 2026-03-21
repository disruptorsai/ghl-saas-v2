import { useState, useMemo } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import { toast } from 'sonner'
import {
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useKnowledgeBase, type KBDocument } from '@/hooks/useKnowledgeBase'
import { useCredentials } from '@/hooks/useCredentials'
import { fireKnowledgeBaseWebhook } from '@/lib/webhooks'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { exportToCsv } from '@/lib/csv-export'

interface FormData {
  title: string
  content: string
  tags: string
}

const defaultFormData: FormData = {
  title: '',
  content: '',
  tags: '',
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

/**
 * Parse n8n-formatted document content that combines title, content, and tags
 * into a single string like:
 *   "Docs Title: Sample\n\nContent:\n  sample\n\nTags: faq, pricing"
 * Falls back to raw content if format doesn't match.
 */
function parseDocContent(raw: string): { title: string; content: string; tags: string } {
  const titleMatch = raw.match(/^Docs Title:\s*(.+?)(?:\n|$)/)
  if (!titleMatch) return { title: '', content: raw, tags: '' }

  const title = titleMatch[1].trim()

  // Extract tags if present
  const tagsMatch = raw.match(/\nTags?:\s*(.+?)(?:\n|$)/i)
  const tags = tagsMatch ? tagsMatch[1].trim() : ''

  // Extract content between "Content:" and "Tags:" (or end of string)
  const contentMatch = raw.match(/\nContent:\s*\n?([\s\S]*?)(?:\nTags?:|\s*$)/i)
  const content = contentMatch ? contentMatch[1].trim() : ''

  return { title, content, tags }
}

function KBSkeletons() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function KnowledgeBase() {
  const { documents, loading, refetch } = useKnowledgeBase()
  const { credentials } = useCredentials()
  const { clientId } = useClientSupabase()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<KBDocument | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [editFormData, setEditFormData] = useState<FormData>(defaultFormData)
  const [deletingDoc, setDeletingDoc] = useState<KBDocument | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const getDocTitle = (doc: KBDocument): string => {
    const metaTitle = doc.metadata?.title as string | undefined
    if (metaTitle) return metaTitle
    if (doc.content) {
      const parsed = parseDocContent(doc.content)
      if (parsed.title) return parsed.title
      return doc.content.slice(0, 60) + (doc.content.length > 60 ? '...' : '')
    }
    return 'Untitled Document'
  }

  const getDocTags = (doc: KBDocument): string[] => {
    const metaTags = doc.metadata?.tags as string[] | undefined
    if (Array.isArray(metaTags) && metaTags.length > 0) return metaTags
    const category = doc.metadata?.Category as string | undefined
    if (category) return parseTags(category)
    if (doc.content) {
      const parsed = parseDocContent(doc.content)
      if (parsed.tags) return parseTags(parsed.tags)
    }
    return []
  }

  const getDocTag = (doc: KBDocument): string | undefined => {
    const category = doc.metadata?.Category as string | undefined
    if (category) return category
    const metaTags = doc.metadata?.tags as string[] | undefined
    if (Array.isArray(metaTags) && metaTags.length > 0) return metaTags.join(', ')
    if (doc.content) {
      const parsed = parseDocContent(doc.content)
      if (parsed.tags) return parsed.tags
    }
    return undefined
  }

  const getDocContent = (doc: KBDocument): string => {
    if (doc.content) {
      const parsed = parseDocContent(doc.content)
      if (parsed.title) return parsed.content
    }
    return doc.content || ''
  }

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    documents.forEach((doc) => {
      getDocTags(doc).forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [documents])

  const filteredDocuments = useMemo(() => {
    let result = documents

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (doc) =>
          (doc.content && doc.content.toLowerCase().includes(q)) ||
          getDocTitle(doc).toLowerCase().includes(q) ||
          getDocTags(doc).some((tag) => tag.toLowerCase().includes(q))
      )
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((doc) =>
        getDocTags(doc).some((tag) => tag === activeTag)
      )
    }

    // Sorting
    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'title') {
        cmp = getDocTitle(a).localeCompare(getDocTitle(b))
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [documents, searchQuery, activeTag, sortBy, sortDir])

  const handleCreate = async () => {
    if (!formData.content.trim()) {
      toast.error('Content is required')
      return
    }
    const kbWebhookUrl = credentials?.knowledge_base_add_webhook_url
    if (!kbWebhookUrl || !clientId) {
      toast.error('Knowledge Base webhook URL not configured. Set it in Credentials → Webhooks.')
      return
    }
    setSubmitting(true)
    try {
      const tags = parseTags(formData.tags)

      await fireKnowledgeBaseWebhook(kbWebhookUrl, {
        action: 'created',
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
        tag: tags.length > 0 ? tags.join(', ') : undefined,
        clientId,
      })

      toast.success('Document submitted for processing')
      setAddDialogOpen(false)
      setFormData(defaultFormData)
      // Refetch after n8n processes the webhook
      setTimeout(() => refetch(), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit document'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (doc: KBDocument) => {
    setEditingDoc(doc)
    setEditFormData({
      title: getDocTitle(doc) === 'Untitled Document' ? '' : getDocTitle(doc),
      content: getDocContent(doc),
      tags: getDocTags(doc).join(', '),
    })
    setEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!editingDoc) return
    if (!editFormData.content.trim()) {
      toast.error('Content is required')
      return
    }
    const kbWebhookUrl = credentials?.knowledge_base_add_webhook_url
    if (!kbWebhookUrl || !clientId) {
      toast.error('Knowledge Base webhook URL not configured. Set it in Credentials → Webhooks.')
      return
    }
    setSubmitting(true)
    try {
      const tags = parseTags(editFormData.tags)

      await fireKnowledgeBaseWebhook(kbWebhookUrl, {
        action: 'updated',
        id: editingDoc.id,
        title: editFormData.title.trim() || undefined,
        content: editFormData.content.trim(),
        tag: tags.length > 0 ? tags.join(', ') : undefined,
        clientId,
      })

      toast.success('Document update submitted')
      setEditDialogOpen(false)
      setEditingDoc(null)
      setTimeout(() => refetch(), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update document'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (doc: KBDocument) => {
    setDeletingDoc(doc)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingDoc) return
    const kbDeleteUrl = credentials?.knowledge_base_delete_webhook_url ?? credentials?.knowledge_base_add_webhook_url
    if (!kbDeleteUrl || !clientId) {
      toast.error('Knowledge Base webhook URL not configured. Set it in Credentials → Webhooks.')
      return
    }
    setSubmitting(true)
    try {
      await fireKnowledgeBaseWebhook(kbDeleteUrl, {
        action: 'deleted',
        id: deletingDoc.id,
        title: getDocTitle(deletingDoc) || undefined,
        content: deletingDoc.content || undefined,
        tag: getDocTag(deletingDoc),
        clientId,
      })

      toast.success('Document deletion submitted')
      setDeleteDialogOpen(false)
      setDeletingDoc(null)
      setTimeout(() => refetch(), 5000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete document'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCsv = () => {
    const rows = filteredDocuments.map((doc) => ({
      title: getDocTitle(doc),
      content: (getDocContent(doc) || '').slice(0, 500),
      tags: getDocTags(doc).join(', '),
      created_at: doc.created_at,
    }))
    exportToCsv(rows, 'knowledge-base-export.csv')
    toast.success('CSV exported successfully')
  }

  const toggleSort = (field: 'title' | 'date') => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir(field === 'title' ? 'asc' : 'desc')
    }
  }

  const SortIcon = ({ field }: { field: 'title' | 'date' }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5" />
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  const renderFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kb-title">Title</Label>
        <Input
          id="kb-title"
          placeholder="e.g. Company FAQ"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kb-content">Content *</Label>
        <Textarea
          id="kb-content"
          placeholder="Enter the knowledge base content..."
          rows={8}
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kb-tags">Tags</Label>
        <Input
          id="kb-tags"
          placeholder="Comma-separated (e.g. faq, pricing, support)"
          value={formData.tags}
          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
        />
        {formData.tags.trim() && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {parseTags(formData.tags).map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Manage knowledge base documents for your AI agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv} disabled={filteredDocuments.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }}>
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents by content, title, or tags..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={sortBy === 'title' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleSort('title')}
          >
            <SortIcon field="title" />
            Title
          </Button>
          <Button
            variant={sortBy === 'date' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleSort('date')}
          >
            <SortIcon field="date" />
            Date
          </Button>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Document count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <KBSkeletons />
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No knowledge base documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first document to start building your knowledge base.
            </p>
            <Button className="mt-4" onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }}>
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No matching documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{getDocTitle(doc)}</span>
                    </div>
                    {doc.content && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {getDocContent(doc)}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      {getDocTags(doc).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {getDocTags(doc).map((tag, i) => (
                            <Badge key={i} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEdit(doc)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(doc)}
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge Base Document</DialogTitle>
            <DialogDescription>
              Create a new document for your AI knowledge base. Embeddings will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setFormData(defaultFormData)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document title, content, and tags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-kb-title">Title</Label>
              <Input
                id="edit-kb-title"
                placeholder="e.g. Company FAQ"
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kb-content">Content *</Label>
              <Textarea
                id="edit-kb-content"
                placeholder="Enter the knowledge base content..."
                rows={8}
                value={editFormData.content}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kb-tags">Tags</Label>
              <Input
                id="edit-kb-tags"
                placeholder="Comma-separated (e.g. faq, pricing, support)"
                value={editFormData.tags}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, tags: e.target.value }))}
              />
              {editFormData.tags.trim() && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {parseTags(editFormData.tags).map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEditingDoc(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingDoc(null)
              }}
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
    </CredentialGate>
  )
}
