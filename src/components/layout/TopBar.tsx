import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationBell from '@/components/NotificationBell'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  campaigns: 'Campaigns',
  'text-ai-rep': 'Text AI Rep',
  'text-ai-rep/configuration': 'Text AI Rep - Configuration',
  'text-ai-rep/templates': 'Text AI Rep - Templates',
  'voice-ai-rep': 'Voice AI Rep',
  'voice-ai-rep/configuration': 'Voice AI Rep - Configuration',
  'voice-ai-rep/templates': 'Voice AI Rep - Templates',
  prompts: 'Prompts',
  'prompts/text': 'Text Prompts',
  'prompts/voice': 'Voice Prompts',
  'knowledge-base': 'Knowledge Base',
  'deploy-ai-reps': 'Deploy AI Reps',
  'debug-ai-reps': 'Debug AI Reps',
  'debug-ai-reps/text': 'Debug Text AI',
  'debug-ai-reps/voice': 'Debug Voice AI',
  'client-portal': 'Client Portal',
  'chat-analytics': 'Chat Analytics',
  'chatbot/dashboard': 'Chatbot Dashboard',
  'chatbot/chat-with-ai': 'Chat with AI',
  'voice-ai/dashboard': 'Voice AI Dashboard',
  'voice-ai/chat-with-ai': 'Voice AI Chat',
  analytics: 'Analytics',
  'webinar-setup': 'Webinar Setup',
  'webinar-setup/checklist': 'Webinar Checklist',
  'webinar-setup/configuration': 'Webinar Configuration',
  'webinar-setup/credentials': 'Webinar Credentials',
  'webinar-setup/analytics': 'Webinar Analytics',
  'webinar-presentation-agent': 'Presentation Agent',
  'demo-pages': 'Demo Pages',
  settings: 'Settings',
  'account-settings': 'Account Settings',
  credentials: 'Credentials',
  'what-to-do': 'What To Do',
}

function getPageTitle(pathname: string): string {
  // Extract the path after /client/:clientId/
  const match = pathname.match(/\/client\/[^/]+\/(.+)/)
  if (match) {
    const subPath = match[1]
    return pageTitles[subPath] ?? 'Page'
  }
  return 'Dashboard'
}

export function TopBar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const pageTitle = getPageTitle(location.pathname)

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold flex-1">{pageTitle}</h1>

      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
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
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
