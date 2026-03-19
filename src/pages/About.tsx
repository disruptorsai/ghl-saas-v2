import { Shield, Key, Eye, TrendingUp } from 'lucide-react'
import { communityInfo } from '@/data/community'

const differentiatorIcons = [Shield, Key, Eye, TrendingUp]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function About() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-20">
      {/* Hero */}
      <section className="text-center pt-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gold-shine mb-4">
          {communityInfo.name}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          {communityInfo.tagline}
        </p>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          {communityInfo.description}
        </p>
      </section>

      {/* What Makes Us Different */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          What Makes Us Different
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {communityInfo.differentiators.map((diff, i) => {
            const Icon = differentiatorIcons[i]
            return (
              <div
                key={diff.title}
                className="bg-card border border-border rounded-xl p-6 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{diff.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {diff.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Your Journey */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Your Journey
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-border" />
          <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-gold/30" />

          {communityInfo.journey.map((step, i) => (
            <div key={step.phase} className="flex flex-col items-center text-center flex-1 relative z-10 px-3">
              <div className="w-10 h-10 rounded-full bg-gold text-black font-bold text-sm flex items-center justify-center mb-3 shadow-lg shadow-gold/20">
                {i + 1}
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">{step.phase}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-0">
          {communityInfo.journey.map((step, i) => (
            <div key={step.phase} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gold text-black font-bold text-sm flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
                  {i + 1}
                </div>
                {i < communityInfo.journey.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gold/30 my-1" />
                )}
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-white text-base mb-1">{step.phase}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Team */}
      <section className="pb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          The Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {communityInfo.team.map((person) => (
            <div
              key={person.name}
              className="bg-card rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg hover:shadow-gold/5 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 text-gold font-bold text-xl flex items-center justify-center mb-4">
                {getInitials(person.name)}
              </div>
              <h3 className="font-bold text-white text-lg">{person.name}</h3>
              <p className="text-sm text-gold font-medium mb-3">{person.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
