import { NavLink } from 'react-router-dom'
import { MessageCircle, GraduationCap, Users, Info, Search, Bell, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/support', label: 'Support', icon: MessageCircle },
  { to: '/classroom', label: 'Classroom', icon: GraduationCap },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/about', label: 'About', icon: Info },
]

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center px-4 md:px-6">
      {/* Left: Logo + Name */}
      <NavLink to="/classroom" className="flex items-center gap-3 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground hidden sm:block">Disruptors Sales Infra</span>
      </NavLink>

      {/* Center: Nav Tabs */}
      <div className="flex items-center gap-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
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
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
          KP
        </div>
      </div>
    </nav>
  )
}
