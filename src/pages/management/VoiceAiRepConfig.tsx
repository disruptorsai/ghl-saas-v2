import { useState, useEffect } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Wifi } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useCredentials } from '@/hooks/useCredentials'

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  id?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  )
}

export default function VoiceAiRepConfig() {
  const { credentials, loading, updateCredentials } = useCredentials()

  // Section 1: Retell AI
  const [retellApiKey, setRetellApiKey] = useState('')
  const [retellInboundAgentId, setRetellInboundAgentId] = useState('')
  const [retellOutboundAgentId, setRetellOutboundAgentId] = useState('')
  const [retellOutboundFollowupAgentId, setRetellOutboundFollowupAgentId] = useState('')
  const [retellAgentId4, setRetellAgentId4] = useState('')
  const [savingRetell, setSavingRetell] = useState(false)
  const [testingRetell, setTestingRetell] = useState(false)
  const [retellTestResult, setRetellTestResult] = useState<'success' | 'error' | null>(null)

  // Section 2: Phone Numbers
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [phone3, setPhone3] = useState('')
  const [savingPhones, setSavingPhones] = useState(false)

  // Section 3: Outbound Caller Webhooks
  const [outboundWebhook1, setOutboundWebhook1] = useState('')
  const [outboundWebhook2, setOutboundWebhook2] = useState('')
  const [outboundWebhook3, setOutboundWebhook3] = useState('')
  const [savingOutboundWebhooks, setSavingOutboundWebhooks] = useState(false)

  // Section 4: GHL Integration
  const [ghlApiKey, setGhlApiKey] = useState('')
  const [ghlLocationId, setGhlLocationId] = useState('')
  const [ghlCalendarId, setGhlCalendarId] = useState('')
  const [ghlAssigneeId, setGhlAssigneeId] = useState('')
  const [savingGhl, setSavingGhl] = useState(false)

  // Populate state from credentials
  useEffect(() => {
    if (credentials) {
      setRetellApiKey(credentials.retell_api_key ?? '')
      setRetellInboundAgentId(credentials.retell_inbound_agent_id ?? '')
      setRetellOutboundAgentId(credentials.retell_outbound_agent_id ?? '')
      setRetellOutboundFollowupAgentId(credentials.retell_outbound_followup_agent_id ?? '')
      setRetellAgentId4(credentials.retell_agent_id_4 ?? '')
      setPhone1(credentials.retell_phone_1 ?? '')
      setPhone2(credentials.retell_phone_2 ?? '')
      setPhone3(credentials.retell_phone_3 ?? '')
      setOutboundWebhook1(credentials.outbound_caller_webhook_1_url ?? '')
      setOutboundWebhook2(credentials.outbound_caller_webhook_2_url ?? '')
      setOutboundWebhook3(credentials.outbound_caller_webhook_3_url ?? '')
      setGhlApiKey(credentials.ghl_api_key ?? '')
      setGhlLocationId(credentials.ghl_location_id ?? '')
      setGhlCalendarId(credentials.ghl_calendar_id ?? '')
      setGhlAssigneeId(credentials.ghl_assignee_id ?? '')
    }
  }, [credentials])

  const handleSaveRetell = async () => {
    setSavingRetell(true)
    try {
      await updateCredentials({
        retell_api_key: retellApiKey,
        retell_inbound_agent_id: retellInboundAgentId,
        retell_outbound_agent_id: retellOutboundAgentId,
        retell_outbound_followup_agent_id: retellOutboundFollowupAgentId,
        retell_agent_id_4: retellAgentId4,
      })
      toast.success('Retell AI settings saved successfully')
    } catch {
      toast.error('Failed to save Retell AI settings')
    } finally {
      setSavingRetell(false)
    }
  }

  const handleTestRetell = async () => {
    if (!retellApiKey.trim()) {
      toast.error('Enter your Retell API key first')
      return
    }
    setTestingRetell(true)
    setRetellTestResult(null)
    try {
      const agentId = retellInboundAgentId.trim() || retellOutboundAgentId.trim()
      const url = agentId
        ? `https://api.retellai.com/v2/agent/${agentId}`
        : 'https://api.retellai.com/v2/agent'
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${retellApiKey.trim()}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const name = agentId
          ? (data.agent_name || data.name || 'Agent found')
          : `${Array.isArray(data) ? data.length : 0} agents found`
        setRetellTestResult('success')
        toast.success(`Retell connection verified: ${name}`)
      } else if (response.status === 401) {
        setRetellTestResult('error')
        toast.error('Invalid API key — check your Retell API key')
      } else {
        setRetellTestResult('error')
        toast.error(`Retell API error: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setRetellTestResult('error')
      toast.error(`Connection failed: ${err instanceof Error ? err.message : 'Network error'}`)
    } finally {
      setTestingRetell(false)
    }
  }

  const handleSavePhones = async () => {
    setSavingPhones(true)
    try {
      await updateCredentials({
        retell_phone_1: phone1,
        retell_phone_2: phone2,
        retell_phone_3: phone3,
      })
      toast.success('Phone numbers saved successfully')
    } catch {
      toast.error('Failed to save phone numbers')
    } finally {
      setSavingPhones(false)
    }
  }

  const handleSaveOutboundWebhooks = async () => {
    setSavingOutboundWebhooks(true)
    try {
      await updateCredentials({
        outbound_caller_webhook_1_url: outboundWebhook1,
        outbound_caller_webhook_2_url: outboundWebhook2,
        outbound_caller_webhook_3_url: outboundWebhook3,
      })
      toast.success('Outbound caller webhooks saved successfully')
    } catch {
      toast.error('Failed to save outbound caller webhooks')
    } finally {
      setSavingOutboundWebhooks(false)
    }
  }

  const handleSaveGhl = async () => {
    setSavingGhl(true)
    try {
      await updateCredentials({
        ghl_api_key: ghlApiKey,
        ghl_location_id: ghlLocationId,
        ghl_calendar_id: ghlCalendarId,
        ghl_assignee_id: ghlAssigneeId,
      })
      toast.success('GHL integration settings saved successfully')
    } catch {
      toast.error('Failed to save GHL integration settings')
    } finally {
      setSavingGhl(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Voice AI Rep Configuration</h1>
        <p className="text-muted-foreground">
          Manage Retell AI, phone numbers, webhooks, and GHL integration for your voice AI agent
        </p>
      </div>

      {/* Section 1: Retell AI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retell AI</CardTitle>
          <CardDescription>
            Configure your Retell AI credentials and agent IDs for voice functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retell-api-key">Retell API Key</Label>
            <PasswordInput
              id="retell-api-key"
              value={retellApiKey}
              onChange={setRetellApiKey}
              placeholder="Enter your Retell API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retell-inbound">Inbound Agent ID</Label>
            <Input
              id="retell-inbound"
              value={retellInboundAgentId}
              onChange={e => setRetellInboundAgentId(e.target.value)}
              placeholder="Enter inbound agent ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retell-outbound">Outbound Agent ID</Label>
            <Input
              id="retell-outbound"
              value={retellOutboundAgentId}
              onChange={e => setRetellOutboundAgentId(e.target.value)}
              placeholder="Enter outbound agent ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retell-outbound-followup">Outbound Followup Agent ID</Label>
            <Input
              id="retell-outbound-followup"
              value={retellOutboundFollowupAgentId}
              onChange={e => setRetellOutboundFollowupAgentId(e.target.value)}
              placeholder="Enter outbound followup agent ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retell-agent-4">Agent ID 4</Label>
            <Input
              id="retell-agent-4"
              value={retellAgentId4}
              onChange={e => setRetellAgentId4(e.target.value)}
              placeholder="Enter agent ID 4"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestRetell}
              disabled={testingRetell || !retellApiKey.trim()}
            >
              {testingRetell ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : retellTestResult === 'success' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Connected
                </>
              ) : retellTestResult === 'error' ? (
                <>
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Failed — Retry
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            <Button onClick={handleSaveRetell} disabled={savingRetell}>
              {savingRetell ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Retell AI Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phone Numbers</CardTitle>
          <CardDescription>
            Configure the phone numbers used by your voice AI agents for inbound and outbound calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Phone Number 1', phone: phone1, setPhone: setPhone1 },
            { label: 'Phone Number 2', phone: phone2, setPhone: setPhone2 },
            { label: 'Phone Number 3', phone: phone3, setPhone: setPhone3 },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <Label>{item.label}</Label>
              <Input
                value={item.phone}
                onChange={e => item.setPhone(e.target.value)}
                placeholder="Enter phone number (e.g., +15551234567)"
              />
            </div>
          ))}
          <Button onClick={handleSavePhones} disabled={savingPhones}>
            {savingPhones ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Phone Numbers'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: Outbound Caller Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outbound Caller Webhooks</CardTitle>
          <CardDescription>
            Configure webhook URLs for outbound calling functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outbound-webhook-1">Outbound Caller Webhook 1 URL</Label>
            <Input
              id="outbound-webhook-1"
              value={outboundWebhook1}
              onChange={e => setOutboundWebhook1(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outbound-webhook-2">Outbound Caller Webhook 2 URL</Label>
            <Input
              id="outbound-webhook-2"
              value={outboundWebhook2}
              onChange={e => setOutboundWebhook2(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outbound-webhook-3">Outbound Caller Webhook 3 URL</Label>
            <Input
              id="outbound-webhook-3"
              value={outboundWebhook3}
              onChange={e => setOutboundWebhook3(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSaveOutboundWebhooks} disabled={savingOutboundWebhooks}>
            {savingOutboundWebhooks ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Outbound Webhooks'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 4: GoHighLevel Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">GoHighLevel Integration</CardTitle>
          <CardDescription>
            Connect your GoHighLevel account for CRM, calendar, and pipeline management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ghl-api-key">GHL API Key</Label>
            <PasswordInput
              id="ghl-api-key"
              value={ghlApiKey}
              onChange={setGhlApiKey}
              placeholder="Enter your GHL API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ghl-location-id">Location ID</Label>
            <Input
              id="ghl-location-id"
              value={ghlLocationId}
              onChange={e => setGhlLocationId(e.target.value)}
              placeholder="Enter GHL location ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ghl-calendar-id">Calendar ID</Label>
            <Input
              id="ghl-calendar-id"
              value={ghlCalendarId}
              onChange={e => setGhlCalendarId(e.target.value)}
              placeholder="Enter GHL calendar ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ghl-assignee-id">Assignee ID</Label>
            <Input
              id="ghl-assignee-id"
              value={ghlAssigneeId}
              onChange={e => setGhlAssigneeId(e.target.value)}
              placeholder="Enter GHL assignee ID"
            />
          </div>
          <Button onClick={handleSaveGhl} disabled={savingGhl}>
            {savingGhl ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save GHL Settings'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
