import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreVertical, Trash2, Edit, Building, LogOut, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30)
    return `Created ${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
  }
  if (diffDays > 0) return `Created ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffHours > 0) return `Created ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffMinutes > 0) return `Created ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  return 'Created just now'
}

function ClientCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3 mt-3" />
      </CardContent>
    </Card>
  )
}

export default function ClientList() {
  const navigate = useNavigate()
  const { clients, loading, deleteClient } = useClients()
  const { user, signOut } = useAuth()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('logo_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.logo_url) setLogoUrl(data.logo_url)
      })
  }, [user])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? 'U'

  const handleDeleteClick = (e: React.MouseEvent, client: { id: string; name: string }) => {
    e.stopPropagation()
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return
    setDeleting(true)
    try {
      await deleteClient(clientToDelete.id)
      toast.success(`"${clientToDelete.name}" has been deleted.`)
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditClick = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation()
    navigate(`/c/${clientId}/settings`)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all your client accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {logoUrl && <AvatarImage src={logoUrl} alt="Profile" />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.user_metadata?.full_name ?? 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {clients.length > 0 && (
                <DropdownMenuItem onClick={() => navigate(`/c/${clients[0].id}/account-settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No clients yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first client to get started. Each client gets their own dashboard, AI reps, and analytics.
          </p>
          <Button onClick={() => navigate('/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Client
          </Button>
        </div>
      )}

      {/* Client Grid */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate(`/c/${client.id}/classroom`)}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Avatar size="lg">
                  <AvatarImage src={client.logo_url || client.image_url || undefined} alt={client.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{client.name}</h3>
                  {client.email && (
                    <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleEditClick(e, client.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => handleDeleteClick(e, { id: client.id, name: client.name })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {client.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {client.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(client.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{clientToDelete?.name}</span>?
              This will permanently remove the client and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
