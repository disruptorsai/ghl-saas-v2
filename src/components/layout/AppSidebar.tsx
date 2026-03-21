import { useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Phone,
  Brain,
  Mic,
  BookOpen,
  Rocket,
  Bug,
  Users,
  BarChart3,
  Bot,
  Video,
  CheckSquare,
  Key,
  Presentation,
  Globe,
  Settings,
  FileText,
  ChevronRight,
  LogOut,
  ChevronsUpDown,
  Plus,
  Trash2,
  Check,
  Activity,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/hooks/useClients'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface NavItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: { title: string; icon: React.ComponentType<{ className?: string }>; path: string }[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  {
    title: 'Getting Started',
    icon: BookOpen,
    children: [
      { title: 'What to Do', icon: CheckSquare, path: 'what-to-do' },
      { title: 'Setup Guide (SOPs)', icon: FileText, path: 'setup-guide' },
    ],
  },
  { title: 'Campaigns', icon: Megaphone, path: 'campaigns' },
  {
    title: 'Text AI Rep',
    icon: MessageSquare,
    children: [
      { title: 'Configuration', icon: Settings, path: 'text-ai-rep/configuration' },
      { title: 'Templates', icon: FileText, path: 'text-ai-rep/templates' },
    ],
  },
  {
    title: 'Voice AI Rep',
    icon: Phone,
    children: [
      { title: 'Configuration', icon: Settings, path: 'voice-ai-rep/configuration' },
      { title: 'Templates', icon: FileText, path: 'voice-ai-rep/templates' },
    ],
  },
  {
    title: 'Prompts',
    icon: Brain,
    children: [
      { title: 'Text Prompts', icon: MessageSquare, path: 'prompts/text' },
      { title: 'Voice Prompts', icon: Mic, path: 'prompts/voice' },
    ],
  },
  { title: 'Knowledge Base', icon: BookOpen, path: 'knowledge-base' },
  { title: 'Deploy AI Reps', icon: Rocket, path: 'deploy-ai-reps' },
  {
    title: 'Debug AI Reps',
    icon: Bug,
    children: [
      { title: 'Text', icon: MessageSquare, path: 'debug-ai-reps/text' },
      { title: 'Voice', icon: Phone, path: 'debug-ai-reps/voice' },
    ],
  },
  { title: 'Client Portal', icon: Users, path: 'client-portal' },
  {
    title: 'Analytics',
    icon: BarChart3,
    children: [
      { title: 'Chat Analytics', icon: MessageSquare, path: 'chat-analytics' },
      { title: 'Chatbot Dashboard', icon: Bot, path: 'chatbot/dashboard' },
      { title: 'Voice AI Dashboard', icon: Phone, path: 'voice-ai/dashboard' },
      { title: 'Call History', icon: Phone, path: 'voice-ai/call-history' },
    ],
  },
  {
    title: 'Webinar Setup',
    icon: Video,
    children: [
      { title: 'Checklist', icon: CheckSquare, path: 'webinar-setup/checklist' },
      { title: 'Configuration', icon: Settings, path: 'webinar-setup/configuration' },
      { title: 'Credentials', icon: Key, path: 'webinar-setup/credentials' },
      { title: 'Analytics', icon: BarChart3, path: 'webinar-setup/analytics' },
      { title: 'Presentation Agent', icon: Presentation, path: 'webinar-presentation-agent' },
    ],
  },
  { title: 'Demo Pages', icon: Globe, path: 'demo-pages' },
  { title: 'Feedback', icon: MessageCircle, path: 'feedback' },
  { title: 'Settings', icon: Settings, path: 'settings' },
  { title: 'Credentials', icon: Key, path: 'credentials' },
  { title: 'Activity Log', icon: Activity, path: 'audit-log' },
]

export function AppSidebar() {
  const location = useLocation()
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth()
  const { clients, deleteClient } = useClients()
  const isAgency = role === 'agency'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const basePath = clientId ? `/c/${clientId}/management` : '/management'

  const currentClient = clients.find((c) => c.id === clientId)

  const isActive = (path: string) => {
    return location.pathname === `${basePath}/${path}`
  }

  const isParentActive = (children: NavItem['children']) => {
    if (!children) return false
    return children.some((child) => location.pathname === `${basePath}/${child.path}`)
  }

  const handleDeleteClient = async () => {
    if (!clientId) return
    try {
      await deleteClient(clientId)
      toast.success('Client deleted')
      navigate('/')
    } catch {
      toast.error('Failed to delete client')
    }
    setDeleteDialogOpen(false)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link to="/" className="flex items-center justify-center py-1">
          <span className="text-gold-shine font-bold text-lg">Disruptors Infra</span>
        </Link>

        {isAgency ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center justify-between rounded-md border border-border/60 bg-background/50 px-3 py-2 text-sm hover:bg-accent hover:border-primary/40 transition-colors">
                  <span className="truncate font-medium">
                    {currentClient?.name ?? 'Select client'}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {clients.map((client) => (
                  <DropdownMenuItem
                    key={client.id}
                    onClick={() => navigate(`/c/${client.id}/classroom`)}
                  >
                    <span className="truncate">{client.name}</span>
                    {client.id === clientId && (
                      <Check className="ml-auto size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/create')}>
                  <Plus className="mr-2 size-4" />
                  Add new client
                </DropdownMenuItem>
                {currentClient && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete {currentClient.name}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete client</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{currentClient?.name}</strong>? This will permanently remove all associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteClient}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="px-3 py-2 text-sm font-medium text-muted-foreground truncate">
            {currentClient?.name ?? 'My Dashboard'}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isParentActive(item.children)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isParentActive(item.children)}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.path}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(child.path)}
                              >
                                <Link to={`${basePath}/${child.path}`}>
                                  <child.icon className="size-4" />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.path!)}
                    >
                      <Link to={`${basePath}/${item.path}`}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm">
            <div className="font-medium truncate">
              {user?.user_metadata?.full_name ?? 'User'}
            </div>
            <div className="text-muted-foreground text-xs truncate">
              {user?.email}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
