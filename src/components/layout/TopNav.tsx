import { NavLink } from 'react-router-dom'
import { MessageCircle, GraduationCap, Users, KeyRound, Settings, Search, Bell, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { to: 'support', label: 'Support', icon: MessageCircle },
  { to: 'classroom', label: 'Classroom', icon: GraduationCap },
  { to: 'members', label: 'Members', icon: Users },
  { to: 'logins', label: 'Logins', icon: KeyRound },
  { to: 'management', label: 'Management', icon: Settings },
]

export function TopNav() {
  const { user, signOut, role } = useAuth()
  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '??'

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center px-4 md:px-6">
      {/* Left: Logo + Name */}
      <NavLink to={role === 'agency' ? '/' : 'classroom'} className="flex items-center mr-auto">
        <span className="font-bold text-lg text-gold-shine">Disruptors Infra</span>
      </NavLink>

      {/* Center: Nav Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground cursor-pointer">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
