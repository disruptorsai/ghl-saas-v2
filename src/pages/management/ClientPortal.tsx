import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  LayoutList,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  useClientPortal,
  type PortalPhase,
  type PortalStep,
  type PortalTask,
} from '@/hooks/useClientPortal'

// ─── Inline‑edit helper ─────────────────────────────────
function InlineEdit({
  value,
  onSave,
}: {
  value: string
  onSave: (v: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  const commit = async () => {
    if (draft.trim() === '' || draft === value) {
      setEditing(false)
      setDraft(value)
      return
    }
    setSaving(true)
    await onSave(draft.trim())
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setEditing(false)
              setDraft(value)
            }
          }}
          className="h-7 w-48 text-sm"
          disabled={saving}
        />
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={commit}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Check />}
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => {
            setEditing(false)
            setDraft(value)
          }}
          disabled={saving}
        >
          <X />
        </Button>
      </span>
    )
  }

  return (
    <span className="group inline-flex items-center gap-1">
      <span className="font-semibold">{value}</span>
      <Button
        size="icon-xs"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
      >
        <Pencil />
      </Button>
    </span>
  )
}

// ─── Delete confirmation dialog ─────────────────────────
function DeleteDialog({
  open,
  label,
  onConfirm,
  onCancel,
}: {
  open: boolean
  label: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {label}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All data inside this {label.toLowerCase()} will
            be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Progress bar ───────────────────────────────────────
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

// ─── Task item ──────────────────────────────────────────
function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: {
  task: PortalTask
  onToggle: (id: string, v: boolean) => Promise<void>
  onUpdate: (id: string, data: { name?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 py-1 group">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(v) => onToggle(task.id, v === true)}
        />
        <span
          className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
        >
          <InlineEdit
            value={task.name}
            onSave={async (v) => onUpdate(task.id, { name: v })}
          />
        </span>
        <Button
          size="icon-xs"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <DeleteDialog
        open={deleteOpen}
        label="Task"
        onConfirm={async () => {
          setDeleteOpen(false)
          await onDelete(task.id)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}

// ─── Add task inline ────────────────────────────────────
function AddTaskInline({
  onAdd,
}: {
  onAdd: (name: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const commit = async () => {
    if (!name.trim()) {
      setAdding(false)
      return
    }
    setSaving(true)
    await onAdd(name.trim())
    setSaving(false)
    setName('')
    setAdding(false)
  }

  if (!adding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setAdding(true)}
      >
        <Plus className="h-3 w-3" />
        Add Task
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <Input
        autoFocus
        placeholder="Task name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setAdding(false)
            setName('')
          }
        }}
        className="h-7 text-sm flex-1"
        disabled={saving}
      />
      <Button size="icon-xs" variant="ghost" onClick={commit} disabled={saving}>
        {saving ? <Loader2 className="animate-spin" /> : <Check />}
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setAdding(false)
          setName('')
        }}
        disabled={saving}
      >
        <X />
      </Button>
    </div>
  )
}

// ─── Step item ──────────────────────────────────────────
function StepItem({
  step,
  onToggle,
  onUpdate,
  onDelete,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}: {
  step: PortalStep
  onToggle: (id: string, v: boolean) => Promise<void>
  onUpdate: (id: string, data: { name?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggleTask: (id: string, v: boolean) => Promise<void>
  onUpdateTask: (id: string, data: { name?: string }) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
  onAddTask: (stepId: string, name: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const contentBlocks = step.content?.blocks ?? []

  return (
    <>
      <div className="rounded-lg border bg-card/50 p-3">
        {/* Step header */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step.completed}
            onCheckedChange={(v) => onToggle(step.id, v === true)}
          />
          <span
            className={`flex-1 ${step.completed ? 'line-through text-muted-foreground' : ''}`}
          >
            <InlineEdit
              value={step.name}
              onSave={async (v) => onUpdate(step.id, { name: v })}
            />
          </span>
          <span className="text-xs text-muted-foreground">
            {step.tasks.length > 0 &&
              `${step.tasks.filter((t) => t.completed).length}/${step.tasks.length} tasks`}
          </span>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
          </Button>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-3 pl-6">
            {/* Content blocks (raw text for now) */}
            {contentBlocks.length > 0 && (
              <div className="rounded bg-muted/50 p-2 text-sm text-muted-foreground">
                {contentBlocks.map((block, i) => (
                  <p key={i}>{typeof block === 'string' ? block : JSON.stringify(block)}</p>
                ))}
              </div>
            )}

            <Separator />

            {/* Tasks */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tasks
              </p>
              {step.tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
              {step.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}
              <AddTaskInline
                onAdd={async (name) => onAddTask(step.id, name)}
              />
            </div>
          </div>
        )}
      </div>

      <DeleteDialog
        open={deleteOpen}
        label="Step"
        onConfirm={async () => {
          setDeleteOpen(false)
          await onDelete(step.id)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}

// ─── Phase card ─────────────────────────────────────────
function PhaseCard({
  phase,
  index,
  totalPhases,
  onUpdatePhase,
  onDeletePhase,
  onMovePhase,
  onAddStep,
  onToggleStep,
  onUpdateStep,
  onDeleteStep,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}: {
  phase: PortalPhase
  index: number
  totalPhases: number
  onUpdatePhase: (id: string, data: { name?: string }) => Promise<void>
  onDeletePhase: (id: string) => Promise<void>
  onMovePhase: (id: string, direction: 'up' | 'down') => void
  onAddStep: (phaseId: string) => Promise<void>
  onToggleStep: (id: string, v: boolean) => Promise<void>
  onUpdateStep: (id: string, data: { name?: string }) => Promise<void>
  onDeleteStep: (id: string) => Promise<void>
  onToggleTask: (id: string, v: boolean) => Promise<void>
  onUpdateTask: (id: string, data: { name?: string }) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
  onAddTask: (stepId: string, name: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const completedSteps = phase.steps.filter((s) => s.completed).length
  const totalSteps = phase.steps.length
  const phasePercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="gap-0 py-0 overflow-hidden">
          {/* Phase header */}
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Badge variant="secondary" className="text-xs shrink-0">
                #{index + 1}
              </Badge>
              <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <InlineEdit
                  value={phase.name}
                  onSave={async (v) => onUpdatePhase(phase.id, { name: v })}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {completedSteps}/{totalSteps} steps
              </span>
              <Badge
                variant={phasePercent === 100 ? 'default' : 'outline'}
                className="text-xs shrink-0"
              >
                {phasePercent}%
              </Badge>
              <div
                className="flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon-xs"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => onMovePhase(phase.id, 'up')}
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  disabled={index === totalPhases - 1}
                  onClick={() => onMovePhase(phase.id, 'down')}
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 />
                </Button>
              </div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          </CollapsibleTrigger>

          {/* Progress bar just below header */}
          <div className="px-4">
            <ProgressBar percent={phasePercent} />
          </div>

          {/* Expanded content */}
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-3">
              {phase.steps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No steps yet. Add your first step to this phase.
                </p>
              )}
              {phase.steps.map((step) => (
                <StepItem
                  key={step.id}
                  step={step}
                  onToggle={onToggleStep}
                  onUpdate={onUpdateStep}
                  onDelete={onDeleteStep}
                  onToggleTask={onToggleTask}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onAddTask={onAddTask}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddStep(phase.id)}
              >
                <Plus className="h-3 w-3" />
                Add Step
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <DeleteDialog
        open={deleteOpen}
        label="Phase"
        onConfirm={async () => {
          setDeleteOpen(false)
          await onDeletePhase(phase.id)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}

// ─── Loading skeleton ───────────────────────────────────
function PortalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────
function EmptyState({ onAddPhase }: { onAddPhase: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <LayoutList className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">No onboarding phases yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add your first onboarding phase to start building out your client
          portal with steps and tasks.
        </p>
      </div>
      <Button onClick={onAddPhase}>
        <Plus className="h-4 w-4" />
        Add Your First Phase
      </Button>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────
export default function ClientPortal() {
  const {
    portal,
    loading,
    addPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    addStep,
    updateStep,
    deleteStep,
    toggleStepCompletion,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    overallPercent,
  } = useClientPortal()

  const handleMovePhase = (phaseId: string, direction: 'up' | 'down') => {
    if (!portal) return
    const ids = portal.phases.map((p) => p.id)
    const idx = ids.indexOf(phaseId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= ids.length) return
    const reordered = [...ids]
    reordered[idx] = ids[swapIdx]
    reordered[swapIdx] = ids[idx]
    reorderPhases(reordered)
  }

  if (loading) {
    return <PortalSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {portal?.name ?? 'Client Onboarding Portal'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage onboarding phases, steps, and tasks
          </p>
        </div>
        <Badge
          variant={overallPercent === 100 ? 'default' : 'secondary'}
          className="text-sm px-3 py-1"
        >
          {overallPercent}% complete
        </Badge>
      </div>

      {/* Overall progress */}
      <ProgressBar percent={overallPercent} />

      {/* Phases or empty state */}
      {portal && portal.phases.length === 0 ? (
        <EmptyState onAddPhase={addPhase} />
      ) : (
        <div className="space-y-4">
          {portal?.phases.map((phase, idx) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={idx}
              totalPhases={portal.phases.length}
              onUpdatePhase={updatePhase}
              onDeletePhase={deletePhase}
              onMovePhase={handleMovePhase}
              onAddStep={addStep}
              onToggleStep={toggleStepCompletion}
              onUpdateStep={updateStep}
              onDeleteStep={deleteStep}
              onToggleTask={toggleTaskCompletion}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddTask={addTask}
            />
          ))}

          <Button variant="outline" onClick={addPhase} className="w-full">
            <Plus className="h-4 w-4" />
            Add Phase
          </Button>
        </div>
      )}
    </div>
  )
}
