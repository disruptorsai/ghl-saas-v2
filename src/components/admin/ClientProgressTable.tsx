import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { AdminClient } from '@/data/types'

function progressColor(progress: number) {
  if (progress < 25) return 'bg-red-500'
  if (progress < 50) return 'bg-orange-400'
  if (progress < 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ClientProgressTableProps {
  clients: AdminClient[]
}

export default function ClientProgressTable({ clients }: ClientProgressTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Client</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Current Module</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-bold text-foreground">{client.name}</div>
                  <div className="text-sm text-muted-foreground">{client.company}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', progressColor(client.progress))}
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{client.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="text-foreground">{client.currentModule}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(client.lastActive)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {client.daysSinceSignup}d
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
