import type { Member } from '@/data/types'

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MemberCard({ member }: { member: Member }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center hover:border-gold/40 card-hover">
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gold/20 flex items-center justify-center">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <span
            className="w-12 h-12 rounded-full bg-gold/20 text-gold font-bold text-sm items-center justify-center absolute inset-0 hidden"
          >
            {getInitials(member.name)}
          </span>
        </div>
        {member.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        )}
      </div>

      <h3 className="font-bold text-white text-base leading-tight">{member.name}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">
        {member.role} &middot; {member.company}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Joined {formatJoinDate(member.joinedAt)}
      </p>
    </div>
  )
}
