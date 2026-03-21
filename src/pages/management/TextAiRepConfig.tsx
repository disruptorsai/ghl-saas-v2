import { useState, useEffect } from 'react'
import { CredentialGate } from '@/components/CredentialGate'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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

export default function TextAiRepConfig() {
  const { credentials, loading, updateCredentials } = useCredentials()

  // Section 1: API Keys
  const [openrouterApiKey, setOpenrouterApiKey] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [savingApiKeys, setSavingApiKeys] = useState(false)

  // Section 2: Webhook URLs
  const [textEngineWebhook, setTextEngineWebhook] = useState('')
  const [textEngineFollowupWebhook, setTextEngineFollowupWebhook] = useState('')
  const [saveReplyWebhookUrl, setSaveReplyWebhookUrl] = useState('')
  const [savingWebhooks, setSavingWebhooks] = useState(false)

  // Section 3: Transfer Settings
  const [transferToHumanWebhookUrl, setTransferToHumanWebhookUrl] = useState('')
  const [userDetailsWebhookUrl, setUserDetailsWebhookUrl] = useState('')
  const [savingTransfer, setSavingTransfer] = useState(false)

  // Populate state from credentials
  useEffect(() => {
    if (credentials) {
      setOpenrouterApiKey(credentials.openrouter_api_key ?? '')
      setOpenaiApiKey(credentials.openai_api_key ?? '')
      setTextEngineWebhook(credentials.text_engine_webhook ?? '')
      setTextEngineFollowupWebhook(credentials.text_engine_followup_webhook ?? '')
      setSaveReplyWebhookUrl(credentials.save_reply_webhook_url ?? '')
      setTransferToHumanWebhookUrl(credentials.transfer_to_human_webhook_url ?? '')
      setUserDetailsWebhookUrl(credentials.user_details_webhook_url ?? '')
    }
  }, [credentials])

  const handleSaveApiKeys = async () => {
    setSavingApiKeys(true)
    try {
      await updateCredentials({
        openrouter_api_key: openrouterApiKey,
        openai_api_key: openaiApiKey,
      })
      toast.success('API keys saved successfully')
    } catch {
      toast.error('Failed to save API keys')
    } finally {
      setSavingApiKeys(false)
    }
  }

  const handleSaveWebhooks = async () => {
    setSavingWebhooks(true)
    try {
      await updateCredentials({
        text_engine_webhook: textEngineWebhook,
        text_engine_followup_webhook: textEngineFollowupWebhook,
        save_reply_webhook_url: saveReplyWebhookUrl,
      })
      toast.success('Webhook URLs saved successfully')
    } catch {
      toast.error('Failed to save webhook URLs')
    } finally {
      setSavingWebhooks(false)
    }
  }

  const handleSaveTransfer = async () => {
    setSavingTransfer(true)
    try {
      await updateCredentials({
        transfer_to_human_webhook_url: transferToHumanWebhookUrl,
        user_details_webhook_url: userDetailsWebhookUrl,
      })
      toast.success('Transfer settings saved successfully')
    } catch {
      toast.error('Failed to save transfer settings')
    } finally {
      setSavingTransfer(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  return (
    <CredentialGate>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Text AI Rep Configuration</h1>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, and transfer settings for your text AI agent
        </p>
      </div>

      {/* Section 1: API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Keys</CardTitle>
          <CardDescription>
            Configure the API keys used by your text AI agent for language model access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
            <PasswordInput
              id="openrouter-api-key"
              value={openrouterApiKey}
              onChange={setOpenrouterApiKey}
              placeholder="Enter your OpenRouter API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai-api-key">OpenAI API Key</Label>
            <PasswordInput
              id="openai-api-key"
              value={openaiApiKey}
              onChange={setOpenaiApiKey}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <Button onClick={handleSaveApiKeys} disabled={savingApiKeys}>
            {savingApiKeys ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save API Keys'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Webhook URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webhook URLs</CardTitle>
          <CardDescription>
            Set up the webhook endpoints for the text engine processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-engine-webhook">Text Engine Webhook URL</Label>
            <Input
              id="text-engine-webhook"
              value={textEngineWebhook}
              onChange={e => setTextEngineWebhook(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text-engine-followup-webhook">Text Engine Followup Webhook URL</Label>
            <Input
              id="text-engine-followup-webhook"
              value={textEngineFollowupWebhook}
              onChange={e => setTextEngineFollowupWebhook(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="save-reply-webhook">Save Reply Webhook URL</Label>
            <Input
              id="save-reply-webhook"
              value={saveReplyWebhookUrl}
              onChange={e => setSaveReplyWebhookUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSaveWebhooks} disabled={savingWebhooks}>
            {savingWebhooks ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Webhook URLs'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: Transfer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Settings</CardTitle>
          <CardDescription>
            Configure webhooks for transferring conversations to humans and retrieving user details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-webhook">Transfer to Human Webhook URL</Label>
            <Input
              id="transfer-webhook"
              value={transferToHumanWebhookUrl}
              onChange={e => setTransferToHumanWebhookUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-details-webhook">User Details Webhook URL</Label>
            <Input
              id="user-details-webhook"
              value={userDetailsWebhookUrl}
              onChange={e => setUserDetailsWebhookUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSaveTransfer} disabled={savingTransfer}>
            {savingTransfer ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Transfer Settings'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </CredentialGate>
  )
}
