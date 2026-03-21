import { useParams, Link } from 'react-router-dom'
import {
  MessageSquare,
  Phone,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const debugOptions = [
  {
    title: 'Debug Text AI',
    description: 'Test your text AI agent in a live chat',
    icon: MessageSquare,
    path: 'text',
  },
  {
    title: 'Debug Voice AI',
    description: 'Test your voice AI agent with simulated calls',
    icon: Phone,
    path: 'voice',
  },
]

const tips = [
  'Start with simple questions to verify your AI agent responds correctly.',
  'Test edge cases like off-topic questions, rude messages, and ambiguous requests.',
  'Check that your booking agent correctly handles appointment scheduling.',
  'Verify that the transfer-to-human flow works as expected.',
  'Review the AI\'s tone and language to make sure it matches your brand persona.',
  'Test with real lead data to ensure the agent pulls correct information.',
]

export default function DebugAiReps() {
  const { clientId } = useParams<{ clientId: string }>()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Debug AI Reps</h1>
        <p className="text-muted-foreground">
          Test and debug your text and voice AI agents
        </p>
      </div>

      {/* Debug cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {debugOptions.map((option) => (
          <Card key={option.path} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <option.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </div>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <Link to={`/c/${clientId}/management/debug-ai-reps/${option.path}`}>
                  Open Debugger
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Debugging Tips</CardTitle>
          </div>
          <CardDescription>
            Best practices for testing your AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
