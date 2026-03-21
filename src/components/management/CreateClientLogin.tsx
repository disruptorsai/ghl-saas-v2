import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

export function CreateClientLogin() {
  const { clientId, connection } = useClientSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!email || !password || !clientId) return
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { email, password, clientId, clientName: connection?.name }
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      toast.success(`Login created for ${email}`)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Access</CardTitle>
        <CardDescription>Create login credentials for this client to access their dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-password">Password</Label>
          <Input
            id="client-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />
        </div>
        <Button onClick={handleCreate} disabled={loading || !email || !password}>
          {loading ? 'Creating...' : 'Create Client Login'}
        </Button>
      </CardContent>
    </Card>
  )
}
