import { modules } from '@/data/modules'
import { OverallProgress } from '@/components/classroom/OverallProgress'
import { ModuleCard } from '@/components/classroom/ModuleCard'
import { useProgress } from '@/hooks/useProgress'

export default function Classroom() {
  const { getModuleProgress } = useProgress()

  return (
    <div className="p-6 space-y-6">
      <OverallProgress />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const isLocked =
            index > 0 && getModuleProgress(modules[index - 1].id).percentage < 100
          return (
            <ModuleCard key={module.id} module={module} isLocked={isLocked} />
          )
        })}
      </div>
    </div>
  )
}
