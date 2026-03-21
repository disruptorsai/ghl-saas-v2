import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Pure CSS/SVG chart components — zero external dependencies

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface StatusCount {
  status: string
  count: number
}

export interface RateSlice {
  name: string
  value: number
  color: string
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#3b82f6',
  active: '#3b82f6',
  Completed: '#22c55e',
  completed: '#22c55e',
  Failed: '#ef4444',
  failed: '#ef4444',
  Pending: '#94a3b8',
  pending: '#94a3b8',
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
      {message}
    </div>
  )
}

export function MessagesOverTimeChart({
  data,
  title = 'Messages Over Time',
}: {
  data: TimeSeriesPoint[]
  title?: string
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent><EmptyState message="No data available" /></CardContent>
      </Card>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-[2px] h-[200px]">
          {data.map((point, i) => {
            const barHeight = Math.max(2, (point.count / max) * 200)
            return (
              <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative">
                <div
                  className="w-full rounded-t bg-blue-500 hover:bg-blue-600 transition-colors cursor-default"
                  style={{ height: `${barHeight}px` }}
                />
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs shadow-md whitespace-nowrap z-10">
                  {point.date}: {point.count}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-[2px] mt-1">
          {data.map((point, i) => (
            <div key={i} className="flex-1 min-w-0 text-center">
              <span className="text-[9px] text-muted-foreground truncate block">
                {i % Math.max(1, Math.floor(data.length / 6)) === 0 ? point.date : ''}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ConversationsByStatusChart({
  data,
  title = 'Conversations by Status',
}: {
  data: StatusCount[]
  title?: string
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent><EmptyState message="No data available" /></CardContent>
      </Card>
    )
  }

  const total = data.reduce((acc, d) => acc + d.count, 0)
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => {
          const color = STATUS_COLORS[item.status] || '#94a3b8'
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          const barPct = max > 0 ? (item.count / max) * 100 : 0
          return (
            <div key={item.status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{item.status}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.count} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${barPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function ResponseRateChart({
  data,
  title = 'Response Rate',
}: {
  data: RateSlice[]
  title?: string
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent><EmptyState message="No data available" /></CardContent>
      </Card>
    )
  }

  const total = data.reduce((acc, d) => acc + d.value, 0)
  const radius = 70
  const strokeWidth = 25
  const center = radius + strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg
          width={center * 2}
          height={center * 2}
          viewBox={`0 0 ${center * 2} ${center * 2}`}
          className="mb-4"
        >
          {data.map((slice) => {
            const pct = total > 0 ? slice.value / total : 0
            const dashLength = circumference * pct
            const dashOffset = circumference * (1 - cumulative / total) + circumference * 0.25
            cumulative += slice.value
            return (
              <circle
                key={slice.name}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
              />
            )
          })}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-bold"
            style={{ fontSize: '24px' }}
          >
            {data[0] ? `${Math.round(data[0].value)}%` : '0%'}
          </text>
        </svg>
        <div className="flex gap-4">
          {data.map((slice) => (
            <div key={slice.name} className="flex items-center gap-1.5 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
              <span>{slice.name}: {Math.round(slice.value)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
