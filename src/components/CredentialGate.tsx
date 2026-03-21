import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ShieldAlert, ArrowRight } from 'lucide-react'
import { useCredentialStatus } from '@/hooks/useCredentialStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Wraps a page and blocks access when required credentials are missing.
 * Extracts the feature path from the current URL automatically.
 */
export function CredentialGate({ children }: { children: React.ReactNode }) {
  const { clientId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { missingForFeature, loading } = useCredentialStatus()

  // Extract feature path from URL: /client/:clientId/campaigns -> campaigns
  const prefix = `/client/${clientId}/`
  const featurePath = location.pathname.startsWith(prefix)
    ? location.pathname.slice(prefix.length).replace(/\/$/, '')
    : ''

  const missing = missingForFeature(featurePath)

  if (loading || missing.length === 0) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Credentials Required</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This feature requires the following credentials to be configured:
            </p>
          </div>
          <div className="space-y-2">
            {missing.map((group) => (
              <div
                key={group.label}
                className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
              >
                <span className="font-medium">{group.label}</span>
                {group.missing.length > 0 && (
                  <span className="text-amber-600"> — {group.missing.join(', ')}</span>
                )}
              </div>
            ))}
          </div>
          <Button onClick={() => navigate(`/client/${clientId}/credentials`)}>
            Go to Credentials
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
