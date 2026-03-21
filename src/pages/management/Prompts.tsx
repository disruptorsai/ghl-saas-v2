import { useNavigate } from 'react-router-dom'
import { MessageSquare, Mic, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrompts } from '@/hooks/usePrompts'

export default function Prompts() {
  const navigate = useNavigate()
  const { prompts: textPrompts, loading: textLoading } = usePrompts('text')
  const { prompts: voicePrompts, loading: voiceLoading } = usePrompts('voice')

  const loading = textLoading || voiceLoading

  const textActive = textPrompts.filter((p) => p.is_active).length
  const voiceActive = voicePrompts.filter((p) => p.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Prompts</h1>
        <p className="text-sm text-muted-foreground">
          Manage your AI prompts for text and voice agents
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('text')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle>Text Prompts</CardTitle>
                <CardDescription>
                  Text-based agent prompts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {textActive} / {textPrompts.length} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('voice')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <Mic className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <CardTitle>Voice Prompts</CardTitle>
                <CardDescription>
                  Voice-based agent prompts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                {voiceActive} / {voicePrompts.length} active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Prompt Slots</p>
              </div>
              <p className="mt-1 text-2xl font-bold">{textPrompts.length + voicePrompts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Active Prompts</p>
              </div>
              <p className="mt-1 text-2xl font-bold">{textActive + voiceActive}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
