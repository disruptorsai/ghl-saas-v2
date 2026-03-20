import { Link } from 'react-router-dom'
import { Users, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react'
import { adminClients } from '@/data/admin'
import ClientProgressTable from '@/components/admin/ClientProgressTable'

export default function Admin() {
  const totalClients = adminClients.length
  const averageProgress = Math.round(
    adminClients.reduce((sum, c) => sum + c.progress, 0) / totalClients
  )
  const needsAttention = adminClients.filter((c) => c.progress < 30).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            to="/classroom"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Clients */}
          <div className="bg-card border border-border border-t-2 border-t-blue-500 rounded-xl p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClients}</p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </div>
          </div>

          {/* Average Progress */}
          <div className="bg-card border border-border border-t-2 border-t-green-500 rounded-xl p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{averageProgress}%</p>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-card border border-border border-t-2 border-t-destructive rounded-xl p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{needsAttention}</p>
                {needsAttention > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                    Needs help
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </div>

        {/* Client table */}
        <ClientProgressTable clients={adminClients} />
      </main>
    </div>
  )
}
