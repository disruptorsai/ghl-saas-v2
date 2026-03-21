import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { toast } from 'sonner'

export default function CreateClient() {
  const navigate = useNavigate()
  const { createClient } = useClients()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Client name is required.')
      return
    }

    setSubmitting(true)
    try {
      const newClient = await createClient({
        name: name.trim(),
        email: email.trim() || undefined,
        description: description.trim() || undefined,
      })
      toast.success(`"${name.trim()}" has been created.`)
      navigate(`/c/${newClient.id}/classroom`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clients
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Client</CardTitle>
          <CardDescription>
            Add a new client to your account. You can configure their settings after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. contact@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this client..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
