import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useWebinarSetup } from '@/hooks/useWebinarSetup'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '60d', label: 'Last 60 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
]

export default function WebinarConfig() {
  const { clientId } = useClientSupabase()
  const { setup, loading, upsertSetup } = useWebinarSetup()

  const [webinarUrl, setWebinarUrl] = useState('')
  const [replayUrl, setReplayUrl] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (setup) {
      setWebinarUrl(setup.webinar_url ?? '')
      setReplayUrl(setup.replay_url ?? '')
      setTimeRange(setup.time_range ?? '30d')
    }
  }, [setup])

  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertSetup({
        webinar_url: webinarUrl || null,
        replay_url: replayUrl || null,
        time_range: timeRange,
      })
      toast.success('Webinar configuration saved successfully')
    } catch (err) {
      toast.error(
        `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/client/${clientId}/webinar-setup`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Webinar Configuration</h1>
          <p className="text-muted-foreground">
            Set up your webinar URLs and time settings
          </p>
        </div>
      </div>

      {/* Configuration form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webinar Settings</CardTitle>
          <CardDescription>
            Configure the URLs and parameters for your webinar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webinar URL */}
          <div className="space-y-2">
            <Label htmlFor="webinar-url">Webinar URL</Label>
            <div className="flex gap-2">
              <Input
                id="webinar-url"
                value={webinarUrl}
                onChange={(e) => setWebinarUrl(e.target.value)}
                placeholder="https://your-webinar-url.com/live"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(webinarUrl, 'Webinar URL')}
                disabled={!webinarUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The URL where attendees will join the live webinar
            </p>
          </div>

          {/* Replay URL */}
          <div className="space-y-2">
            <Label htmlFor="replay-url">Replay URL</Label>
            <div className="flex gap-2">
              <Input
                id="replay-url"
                value={replayUrl}
                onChange={(e) => setReplayUrl(e.target.value)}
                placeholder="https://your-webinar-url.com/replay"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(replayUrl, 'Replay URL')}
                disabled={!replayUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The URL for the webinar replay recording
            </p>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label htmlFor="time-range">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The default time range for analytics data
            </p>
          </div>

          {/* Save button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
