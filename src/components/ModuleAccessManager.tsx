import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { modules } from '@/data/modules'
import { TIER_MODULES } from '@/hooks/useModuleAccess'
import { toast } from 'sonner'
import { Lock, Unlock, RotateCcw, Loader2 } from 'lucide-react'

interface ModuleAccessManagerProps {
  clientId: string
  clientName: string
  currentTier: string
  currentOverrides: Record<string, boolean>
  onSaved: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TIERS = ['starter', 'growth', 'full_suite'] as const

const TIER_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  full_suite: 'Full Suite',
}

type OverrideState = true | false | undefined

function cycleOverride(current: OverrideState): OverrideState {
  if (current === undefined) return true    // no override -> force unlock
  if (current === true) return false         // force unlock -> force lock
  return undefined                           // force lock -> no override
}

export function ModuleAccessManager({
  clientId,
  clientName,
  currentTier,
  currentOverrides,
  onSaved,
  open,
  onOpenChange,
}: ModuleAccessManagerProps) {
  const [tier, setTier] = useState(currentTier || 'full_suite')
  const [overrides, setOverrides] = useState<Record<string, boolean>>(
    () => ({ ...currentOverrides })
  )
  const [saving, setSaving] = useState(false)

  // Reset state when dialog opens with new data
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setTier(currentTier || 'full_suite')
        setOverrides({ ...currentOverrides })
      }
      onOpenChange(isOpen)
    },
    [currentTier, currentOverrides, onOpenChange]
  )

  const tierModules = TIER_MODULES[tier] ?? TIER_MODULES.full_suite

  const handleToggleOverride = (moduleId: string) => {
    setOverrides((prev) => {
      const currentVal: OverrideState = prev[moduleId]
      const next = cycleOverride(currentVal)
      const updated = { ...prev }
      if (next === undefined) {
        delete updated[moduleId]
      } else {
        updated[moduleId] = next
      }
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({ tier, module_overrides: overrides })
        .eq('id', clientId)
      if (error) throw error
      toast.success('Module access updated successfully.')
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save module access')
    } finally {
      setSaving(false)
    }
  }

  const getModuleState = (moduleId: string) => {
    const override = overrides[moduleId]
    if (override === true) return 'override-unlock' as const
    if (override === false) return 'override-lock' as const
    return tierModules.includes(moduleId) ? 'tier-included' as const : 'tier-excluded' as const
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Module Access &mdash; {clientName}</DialogTitle>
        </DialogHeader>

        {/* Tier Selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Tier</p>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <Button
                key={t}
                variant={tier === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTier(t)}
              >
                {TIER_LABELS[t]}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Module Grid */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {modules.map((mod) => {
            const state = getModuleState(mod.id)
            return (
              <div
                key={mod.id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status dot */}
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      state === 'override-unlock' || state === 'tier-included'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium truncate">{mod.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* State badge */}
                  {state === 'tier-included' && (
                    <Badge variant="secondary" className="text-xs text-muted-foreground">
                      From tier
                    </Badge>
                  )}
                  {state === 'tier-excluded' && (
                    <Badge variant="secondary" className="text-xs text-muted-foreground">
                      From tier
                    </Badge>
                  )}
                  {state === 'override-unlock' && (
                    <Badge className="text-xs bg-green-600 hover:bg-green-700">
                      <Unlock className="mr-1 h-3 w-3" />
                      Unlocked
                    </Badge>
                  )}
                  {state === 'override-lock' && (
                    <Badge variant="destructive" className="text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  )}

                  {/* Cycle button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggleOverride(mod.id)}
                    title="Cycle: no override → force unlock → force lock → no override"
                  >
                    {overrides[mod.id] === undefined ? (
                      <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : overrides[mod.id] === true ? (
                      <Unlock className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-red-600" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
