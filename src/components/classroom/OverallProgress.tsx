import { useProgress } from '@/hooks/useProgress'
import { useModuleAccess } from '@/hooks/useModuleAccess'
import { modules } from '@/data/modules'

export function OverallProgress() {
  const { getModuleProgress } = useProgress()
  const { isModuleUnlocked } = useModuleAccess()

  const unlockedModules = modules.filter(m => isModuleUnlocked(m.id))
  const total = unlockedModules.reduce((sum, m) => sum + m.steps.length, 0)
  const completed = unlockedModules.reduce((sum, m) => sum + getModuleProgress(m.id).completed, 0)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        Your Setup Progress
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {percentage}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {completed} of {total} steps completed
      </p>
    </div>
  )
}
