import { Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { GhlPath } from '@/hooks/useGhlPath'

interface GhlPathSelectionProps {
  onSelect: (path: GhlPath) => void
}

export function GhlPathSelection({ onSelect }: GhlPathSelectionProps) {
  const [selected, setSelected] = useState<'own' | 'sub' | null>(null)

  const handleConfirm = () => {
    if (selected) onSelect(selected)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Choose Your Setup Path
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            How you onboard depends on your GoHighLevel account type. Pick the option that matches your situation.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Own Account - $297 */}
          <button
            onClick={() => setSelected('own')}
            className={cn(
              'relative rounded-2xl border-2 p-6 text-left transition-all duration-200',
              selected === 'own'
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border hover:border-primary/40 bg-card',
            )}
          >
            {selected === 'own' && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="rounded-xl bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Own GHL Account
            </h3>
            <p className="text-2xl font-bold text-primary mb-3">
              $297<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You have (or will create) your own GoHighLevel account. Full control, direct billing, complete ownership.
            </p>
            <ul className="space-y-2">
              {[
                'Full admin access to GHL',
                'You manage your own API keys',
                'Direct Twilio account setup',
                'Complete data portability',
                'Hands-on setup with CSM guidance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </button>

          {/* Sub-Account - Included */}
          <button
            onClick={() => setSelected('sub')}
            className={cn(
              'relative rounded-2xl border-2 p-6 text-left transition-all duration-200',
              selected === 'sub'
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border hover:border-primary/40 bg-card',
            )}
          >
            {selected === 'sub' && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="rounded-xl bg-emerald-500/10 w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Disruptors Sub-Account
            </h3>
            <p className="text-2xl font-bold text-emerald-500 mb-3">
              Included<span className="text-sm font-normal text-muted-foreground"> in your plan</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              We set up a sub-account for you under our agency. No extra subscription — everything is handled for you.
            </p>
            <ul className="space-y-2">
              {[
                'No GHL subscription needed',
                'We configure all API keys for you',
                'Twilio setup handled by your CSM',
                'Simplified onboarding experience',
                'Done-for-you technical setup',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </button>
        </div>

        {/* Confirm */}
        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            disabled={!selected}
            onClick={handleConfirm}
            className="gap-2 px-8"
          >
            Continue with {selected === 'own' ? 'Own Account' : selected === 'sub' ? 'Sub-Account' : '...'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            You can change this later in Settings
          </p>
        </div>
      </div>
    </div>
  )
}
