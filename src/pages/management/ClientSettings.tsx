import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useClientConfig } from '@/hooks/useClientConfig'

function ImageUpload({
  label,
  currentUrl,
  onUpload,
  uploading,
}: {
  label: string
  currentUrl: string
  onUpload: (file: File) => void
  uploading: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentUrl && (
        <div className="relative w-24 h-24 rounded-md border overflow-hidden">
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {currentUrl ? 'Change' : 'Upload'}
        </Button>
      </div>
    </div>
  )
}

export default function ClientSettings() {
  const { clientId } = useParams<{ clientId: string }>()
  const { config, loading, updateConfig } = useClientConfig(clientId ?? '')

  // Basic Info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [savingBasic, setSavingBasic] = useState(false)

  // Branding
  const [logoUrl, setLogoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Display
  const [sortOrder, setSortOrder] = useState(0)
  const [presentationOnly, setPresentationOnly] = useState(false)
  const [savingDisplay, setSavingDisplay] = useState(false)

  useEffect(() => {
    if (config) {
      setName((config.name as string) ?? '')
      setEmail((config.email as string) ?? '')
      setDescription((config.description as string) ?? '')
      setSystemPrompt((config.system_prompt as string) ?? '')
      setLogoUrl((config.logo_url as string) ?? '')
      setImageUrl((config.image_url as string) ?? '')
      setSortOrder((config.sort_order as number) ?? 0)
      setPresentationOnly((config.presentation_only_mode as boolean) ?? false)
    }
  }, [config])

  const handleSaveBasicInfo = async () => {
    if (!name.trim()) {
      toast.error('Client name is required')
      return
    }
    setSavingBasic(true)
    try {
      await updateConfig({
        name: name.trim(),
        email: email.trim(),
        description: description.trim(),
        system_prompt: systemPrompt.trim(),
      })
      toast.success('Basic info saved successfully')
    } catch {
      toast.error('Failed to save basic info')
    } finally {
      setSavingBasic(false)
    }
  }

  const handleImageUpload = async (
    file: File,
    field: 'logo_url' | 'image_url',
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${clientId}/${field}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      await updateConfig({ [field]: publicUrl })
      setUrl(publicUrl)
      toast.success('Image uploaded successfully')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveDisplay = async () => {
    setSavingDisplay(true)
    try {
      await updateConfig({
        sort_order: sortOrder,
        presentation_only_mode: presentationOnly,
      })
      toast.success('Display settings saved successfully')
    } catch {
      toast.error('Failed to save display settings')
    } finally {
      setSavingDisplay(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Client Settings</h1>
        <p className="text-muted-foreground">
          Manage your client configuration, branding, and display preferences
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Info</CardTitle>
          <CardDescription>
            Core information about this client account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name *</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-description">Description</Label>
            <Textarea
              id="client-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this client..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Default AI system prompt for this client..."
              rows={6}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be used as the default system prompt for AI interactions
            </p>
          </div>
          <Button onClick={handleSaveBasicInfo} disabled={savingBasic}>
            {savingBasic ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Basic Info'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branding</CardTitle>
          <CardDescription>
            Upload logos and images for client branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            label="Client Logo"
            currentUrl={logoUrl}
            uploading={uploadingLogo}
            onUpload={(file) =>
              handleImageUpload(file, 'logo_url', setLogoUrl, setUploadingLogo)
            }
          />
          <ImageUpload
            label="Client Image"
            currentUrl={imageUrl}
            uploading={uploadingImage}
            onUpload={(file) =>
              handleImageUpload(file, 'image_url', setImageUrl, setUploadingImage)
            }
          />
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display</CardTitle>
          <CardDescription>
            Control how this client appears in the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort Order</Label>
            <Input
              id="sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the client list
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="presentation-mode">Presentation Only Mode</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, restricts access to presentation features only
              </p>
            </div>
            <Switch
              id="presentation-mode"
              checked={presentationOnly}
              onCheckedChange={setPresentationOnly}
            />
          </div>
          <Button onClick={handleSaveDisplay} disabled={savingDisplay}>
            {savingDisplay ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Display Settings'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
