import { modules } from '@/data/modules'
import { OverallProgress } from '@/components/classroom/OverallProgress'
import { ModuleCard } from '@/components/classroom/ModuleCard'

export default function Classroom() {
  return (
    <div className="p-6 space-y-6">
      <OverallProgress />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  )
}
