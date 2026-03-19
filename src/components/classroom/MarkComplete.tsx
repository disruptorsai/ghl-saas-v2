import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/hooks/useProgress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MarkCompleteProps {
  stepId: string
  onComplete?: () => void
}

export function MarkComplete({ stepId, onComplete }: MarkCompleteProps) {
  const { isStepCompleted, toggleStep } = useProgress()
  const completed = isStepCompleted(stepId)

  function handleClick() {
    const wasCompleted = completed
    toggleStep(stepId)

    if (!wasCompleted) {
      toast.success('Step completed! 🎉')
      onComplete?.()
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(
        'w-full',
        completed
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : ''
      )}
      size="lg"
    >
      <CheckCircle2 className="h-4 w-4" />
      {completed ? 'Completed ✓' : 'Mark as Complete'}
    </Button>
  )
}
