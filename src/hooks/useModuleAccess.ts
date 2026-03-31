import { useMemo } from 'react'
import { useClientSupabase } from '@/contexts/UserSupabaseContext'
import { useAuth } from '@/contexts/AuthContext'

export const TIER_MODULES: Record<string, string[]> = {
  starter: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
  ],
  growth: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
    'db-reactivation',
    'lead-followup',
    'appointment-reminders',
  ],
  full_suite: [
    'welcome',
    'api-setup',
    'twilio-setup',
    'voice-receptionist',
    'db-reactivation',
    'lead-followup',
    'appointment-reminders',
    'quote-followup',
    'review-request',
    'website-chatbot',
    'a2p-registration',
    'knowledge-base',
    'testing',
    'management',
    'prompt-playground',
  ],
}

export function useModuleAccess() {
  const { connection } = useClientSupabase()
  const { role } = useAuth()

  const tier = connection?.tier ?? 'full_suite'
  const overrides = (connection?.module_overrides ?? {}) as Record<string, boolean>

  const isModuleUnlocked = useMemo(() => {
    return (moduleId: string): boolean => {
      // Agency users always see everything
      if (role === 'agency') return true

      // Explicit override takes priority
      if (overrides[moduleId] === true) return true
      if (overrides[moduleId] === false) return false

      // Fall back to tier defaults
      const tierModules = TIER_MODULES[tier] ?? TIER_MODULES.full_suite
      return tierModules.includes(moduleId)
    }
  }, [tier, overrides, role])

  return { tier, overrides, isModuleUnlocked }
}
