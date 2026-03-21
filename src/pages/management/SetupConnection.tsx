import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, CheckCircle, Loader2, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMigration } from '@/hooks/useMigration'
import { createUserSupabase } from '@/lib/user-supabase'
import { MIGRATION_SQL } from '@/lib/migration-sql'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

type SetupStep = 'credentials' | 'migrating' | 'success' | 'error'

export default function SetupConnection() {
  const navigate = useNavigate()
  const { clientId } = useParams<{ clientId: string }>()
  const { connection, isConnected, refetchConnection } = useClientSupabase()
  const { runMigration, error: migrationError, progress } = useMigration()

  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [step, setStep] = useState<SetupStep>('credentials')
  const [testing, setTesting] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isConnected) {
      navigate(`/client/${clientId}/dashboard`, { replace: true })
    }
  }, [isConnected, navigate, clientId])

  useEffect(() => {
    if (connection?.supabase_url) setSupabaseUrl(connection.supabase_url)
    if (connection?.supabase_service_key) setServiceKey(connection.supabase_service_key)
  }, [connection])

  const normalizeUrl = (url: string) => {
    let normalized = url.trim()
    if (normalized.endsWith('/')) normalized = normalized.slice(0, -1)
    return normalized
  }

  const handleTestConnection = async () => {
    if (!supabaseUrl || !serviceKey) {
      toast.error('Please enter both the Supabase URL and Service Role Key.')
      return
    }
    setTesting(true)
    setTestPassed(false)
    try {
      const url = normalizeUrl(supabaseUrl)
      const client = createUserSupabase(url, serviceKey)
      const { error } = await client.from('_placeholder_ping').select('*').limit(1)
      if (error && !error.message.includes('does not exist') && !error.message.includes('schema cache') && !error.code?.startsWith('42')) {
        throw new Error(error.message)
      }
      setTestPassed(true)
      toast.success('Connection successful! Your Supabase project is reachable.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not connect'
      toast.error(`Connection failed: ${msg}`)
      setTestPassed(false)
    } finally {
      setTesting(false)
    }
  }

  const updateClientConnection = async (
    url: string,
    key: string,
    status: string,
    migError?: string
  ) => {
    if (!clientId) return
    const updates: Record<string, unknown> = {
      supabase_url: url,
      supabase_service_key: key,
      migration_status: status,
      updated_at: new Date().toISOString(),
    }
    if (migError) updates.migration_error = migError
    if (status === 'completed') updates.migration_error = null
    await supabase.from('clients').update(updates).eq('id', clientId)
    await refetchConnection()
  }

  const handleConnect = async () => {
    if (!supabaseUrl || !serviceKey || !clientId) {
      toast.error('Please enter both the Supabase URL and Service Role Key.')
      return
    }
    setConnecting(true)
    setErrorMessage('')
    try {
      const url = normalizeUrl(supabaseUrl)
      await updateClientConnection(url, serviceKey, 'running')
      setStep('migrating')

      const success = await runMigration(url, serviceKey)
      if (success) {
        await updateClientConnection(url, serviceKey, 'completed')
        setStep('success')
        toast.success('Database setup complete!')
        setTimeout(() => navigate(`/client/${clientId}/dashboard`, { replace: true }), 2000)
      } else {
        const errMsg =
          migrationError || 'Migration could not be verified. Run the SQL manually.'
        await updateClientConnection(url, serviceKey, 'failed', errMsg)
        setErrorMessage(errMsg)
        setStep('error')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrorMessage(msg)
      setStep('error')
      try {
        await updateClientConnection(normalizeUrl(supabaseUrl), serviceKey, 'failed', msg)
      } catch {
        /* ignore */
      }
    } finally {
      setConnecting(false)
    }
  }

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(MIGRATION_SQL)
      toast.success('Migration SQL copied to clipboard!')
    } catch {
      toast.error('Failed to copy. Please select and copy manually.')
    }
  }

  const handleRetry = () => {
    setStep('credentials')
    setErrorMessage('')
    setTestPassed(false)
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Connect Supabase Project</CardTitle>
          <CardDescription>
            This client needs its own Supabase project for data storage. Enter the project
            credentials below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase Project URL</Label>
                  <Input
                    id="supabase-url"
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => {
                      setSupabaseUrl(e.target.value)
                      setTestPassed(false)
                    }}
                  />
                  <p className="text-muted-foreground text-xs">
                    Found in your Supabase dashboard under{' '}
                    <strong>Settings &gt; API &gt; Project URL</strong>.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-key">Service Role Key</Label>
                  <Input
                    id="service-key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    value={serviceKey}
                    onChange={(e) => {
                      setServiceKey(e.target.value)
                      setTestPassed(false)
                    }}
                  />
                  <p className="text-muted-foreground text-xs">
                    Found under <strong>Settings &gt; API &gt; Service Role Key</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
                >
                  Open Supabase Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || !supabaseUrl || !serviceKey}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : testPassed ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Connection Verified
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={connecting || !supabaseUrl || !serviceKey}
                  className="w-full"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Connect &amp; Setup Database
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
          {step === 'migrating' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-semibold">Setting up database...</p>
                <p className="text-muted-foreground text-sm">
                  Creating tables, functions, and indexes.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-xs text-center mt-2">
                  {progress}% complete
                </p>
              </div>
            </div>
          )}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">Database Connected!</p>
                <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
              </div>
              <Button
                onClick={() => navigate(`/client/${clientId}/dashboard`, { replace: true })}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
          {step === 'error' && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Migration Failed</p>
                  <p className="text-muted-foreground text-sm">{errorMessage}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Run the migration SQL manually in your Supabase SQL Editor.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopySQL} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Migration SQL
                  </Button>
                  <a
                    href="https://supabase.com/dashboard/project/_/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open SQL Editor
                    </Button>
                  </a>
                </div>
              </div>
              <Button variant="outline" onClick={handleRetry} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
