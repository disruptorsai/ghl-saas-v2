import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CredentialGate } from '@/components/CredentialGate'
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  PhoneOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useCredentials } from '@/hooks/useCredentials'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended'

interface ExecutionLog {
  id: string
  created_at: string
  event_type: string
  status: string
  details: string | null
}

const callStatusConfig: Record<CallStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  idle: { label: 'Idle', variant: 'secondary' },
  ringing: { label: 'Ringing...', variant: 'outline' },
  connected: { label: 'Connected', variant: 'default' },
  ended: { label: 'Ended', variant: 'destructive' },
}

export default function DebugVoiceAi() {
  const { clientDb, clientId } = useClientSupabase()
  const { credentials, loading } = useCredentials()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [calling, setCalling] = useState(false)
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  const webhookUrl = credentials?.outbound_caller_webhook_1_url ?? undefined
  const retellApiKey = credentials?.retell_api_key ?? undefined
  const inboundAgentId = credentials?.retell_inbound_agent_id ?? undefined
  const outboundAgentId = credentials?.retell_outbound_agent_id ?? undefined
  const phone1 = credentials?.retell_phone_1 ?? undefined
  const phone2 = credentials?.retell_phone_2 ?? undefined
  const phone3 = credentials?.retell_phone_3 ?? undefined

  // Fetch execution logs from client's DB
  useEffect(() => {
    if (!clientDb) return
    const fetchLogs = async () => {
      setLoadingLogs(true)
      const { data } = await clientDb
        .from('execution_logs')
        .select('id, created_at, event_type, status, details')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) {
        setLogs(data as ExecutionLog[])
      }
      setLoadingLogs(false)
    }
    fetchLogs()
  }, [clientDb])

  // Poll execution_logs for real call status after initiating
  const pollCallStatus = (startTime: number) => {
    if (!clientDb) return
    const pollInterval = setInterval(async () => {
      // Stop polling after 120 seconds
      if (Date.now() - startTime > 120000) {
        clearInterval(pollInterval)
        setCallStatus('ended')
        return
      }
      const { data } = await clientDb
        .from('execution_logs')
        .select('status, details, event_type')
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) {
        const latest = data[0]
        const status = (latest.status as string)?.toLowerCase()
        if (status === 'completed' || status === 'success' || status === 'ended') {
          setCallStatus('ended')
          toast.success('Test call completed')
          clearInterval(pollInterval)
          // Refresh logs
          const { data: newLogs } = await clientDb
            .from('execution_logs')
            .select('id, created_at, event_type, status, details')
            .order('created_at', { ascending: false })
            .limit(20)
          if (newLogs) setLogs(newLogs as ExecutionLog[])
        } else if (status === 'failed' || status === 'error') {
          setCallStatus('ended')
          toast.error(`Call failed: ${latest.details || 'Unknown error'}`)
          clearInterval(pollInterval)
        } else if (status === 'in_progress' || status === 'connected' || status === 'active') {
          setCallStatus('connected')
        }
      }
    }, 3000)
    return pollInterval
  }

  const handleTestCall = async () => {
    if (!phoneNumber.trim() || calling) return

    setCalling(true)
    setCallStatus('ringing')

    try {
      const response = await fetch(webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber.trim(),
          client_id: clientId,
          test_call: true,
        }),
      })

      if (response.ok) {
        setCallStatus('connected')
        toast.success('Test call initiated — monitoring status...')
        // Poll for real call status from execution_logs
        pollCallStatus(Date.now())
      } else {
        setCallStatus('ended')
        toast.error(`Call failed: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setCallStatus('ended')
      toast.error(
        `Call failed: ${err instanceof Error ? err.message : 'Could not reach webhook'}`
      )
    } finally {
      setCalling(false)
    }
  }

  const configChecks = [
    { label: 'Retell API Key', configured: !!retellApiKey?.trim() },
    { label: 'Inbound Agent ID', configured: !!inboundAgentId?.trim() },
    { label: 'Outbound Agent ID', configured: !!outboundAgentId?.trim() },
    { label: 'Phone Number 1', configured: !!phone1?.trim(), value: phone1 },
    { label: 'Phone Number 2', configured: !!phone2?.trim(), value: phone2 },
    { label: 'Phone Number 3', configured: !!phone3?.trim(), value: phone3 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const statusInfo = callStatusConfig[callStatus]

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/client/${clientId}/debug-ai-reps`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Debug Voice AI Rep</h1>
          <p className="text-muted-foreground">
            Test your voice AI agent with simulated calls
          </p>
        </div>
      </div>

      {/* Configuration check card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Status</CardTitle>
          <CardDescription>
            Verify your voice AI configuration before making test calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {configChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2">
                {check.configured ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span className="text-sm">{check.label}</span>
                {check.configured && check.value && (
                  <span className="text-xs text-muted-foreground">({check.value})</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook warning */}
      {!webhookUrl && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Webhook Not Configured</AlertTitle>
          <AlertDescription>
            Please configure the Outbound Caller Webhook URL in Voice AI Rep Configuration before making test calls.
          </AlertDescription>
        </Alert>
      )}

      {/* Test call card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Make Test Call</CardTitle>
              <CardDescription>
                Initiate an outbound test call to verify your voice AI agent
              </CardDescription>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="test-phone"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={calling}
              />
              <Button
                onClick={handleTestCall}
                disabled={!webhookUrl || !phoneNumber.trim() || calling}
              >
                {calling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calling...
                  </>
                ) : callStatus === 'connected' ? (
                  <>
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Call
                  </>
                ) : (
                  <>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Make Test Call
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Call status indicator */}
          {callStatus !== 'idle' && (
            <div className="flex items-center gap-2 rounded-lg border p-3">
              {callStatus === 'ringing' && (
                <Phone className="h-5 w-5 animate-pulse text-amber-500" />
              )}
              {callStatus === 'connected' && (
                <Phone className="h-5 w-5 text-green-500" />
              )}
              {callStatus === 'ended' && (
                <PhoneOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {callStatus === 'ringing' && 'Initiating call...'}
                  {callStatus === 'connected' && 'Call in progress'}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {phoneNumber}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Execution Logs</CardTitle>
          <CardDescription>
            Recent voice AI execution logs for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No execution logs found.</p>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{log.event_type}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
