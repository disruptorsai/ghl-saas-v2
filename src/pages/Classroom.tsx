import { modules } from '@/data/modules'
import { OverallProgress } from '@/components/classroom/OverallProgress'
import { ModuleCard } from '@/components/classroom/ModuleCard'
import { useProgress } from '@/hooks/useProgress'
import { useGhlPath } from '@/hooks/useGhlPath'
import { GhlPathSelection } from '@/components/classroom/GhlPathSelection'
import { Building2, Users, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sub-account clients skip these technical modules entirely
const SUB_ACCOUNT_SKIP = new Set(['api-setup', 'twilio-setup'])

export default function Classroom() {
  const { getModuleProgress } = useProgress()
  const { path, setPath, isSub } = useGhlPath()

  // Show path selection if not yet chosen
  if (!path) {
    return <GhlPathSelection onSelect={setPath} />
  }

  // Filter modules based on path
  const visibleModules = isSub
    ? modules.filter((m) => !SUB_ACCOUNT_SKIP.has(m.id))
    : modules

  return (
    <div className="p-6 space-y-6">
      {/* Path badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          {isSub ? (
            <Users className="h-4 w-4 text-emerald-500" />
          ) : (
            <Building2 className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {isSub ? 'Sub-Account Path' : 'Own Account ($297/mo)'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setPath(null)}
          >
            <Settings2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <OverallProgress />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleModules.map((module, index) => {
          const isLocked =
            index > 0 &&
            getModuleProgress(visibleModules[index - 1].id).percentage < 100
          return (
            <ModuleCard key={module.id} module={module} isLocked={isLocked} />
          )
        })}
      </div>
    </div>
  )
}
