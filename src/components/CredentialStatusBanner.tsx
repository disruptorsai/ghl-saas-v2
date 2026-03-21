import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useCredentialStatus } from '@/hooks/useCredentialStatus'
import { Button } from '@/components/ui/button'

export function CredentialStatusBanner() {
  const { groups, allConfigured, loading } = useCredentialStatus()
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  if (loading) return null

  const groupList = Object.values(groups)

  return (
    <div
      className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allConfigured ? (
            <CheckCircle2 className="size-5 text-primary" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
          <span className="font-medium text-sm">
            {allConfigured
              ? 'APIs and Webhooks Configured'
              : 'Missing Required Credentials'}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          See more
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-current/10 pt-3">
          {groupList.map((group) => (
            <div key={group.label} className="flex items-center justify-between text-sm">
              <span>{group.label}</span>
              {group.configured ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  Missing
                </span>
              )}
            </div>
          ))}
          {!allConfigured && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 border-current/20 text-current hover:bg-current/10"
              onClick={() => navigate(`/c/${clientId}/management/credentials`)}
            >
              Configure Credentials
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
