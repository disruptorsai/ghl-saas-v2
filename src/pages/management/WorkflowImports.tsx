import { Link } from 'react-router-dom'
import { ArrowLeft, Download, FileJson, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WorkflowItem {
  name: string
  description: string
  category: string
  filePath: string
  fileName: string
}

const WORKFLOWS: WorkflowItem[] = [
  {
    name: 'Database Reactivation',
    description: 'Launches a reactivation campaign to re-engage dormant leads in the database using automated outreach sequences.',
    category: 'Campaigns',
    filePath: '/workflows/database-reactivation/Launch_Campaign.json',
    fileName: 'Launch_Campaign.json',
  },
  {
    name: 'Knowledge Base Automation',
    description: 'Automatically syncs and updates the knowledge base entries when content is added or modified.',
    category: 'Knowledge Base',
    filePath: '/workflows/knowledgebase-automation/Update_Knowledgebase.json',
    fileName: 'Update_Knowledgebase.json',
  },
  {
    name: 'Text Engine',
    description: 'Core text AI processing engine that handles inbound messages, generates AI responses, and manages conversation flow.',
    category: 'Text AI',
    filePath: '/workflows/text-engine/Text_Engine.json',
    fileName: 'Text_Engine.json',
  },
  {
    name: 'Appointment Booking Functions',
    description: 'Handles appointment booking logic for the voice sales rep including calendar checks and confirmations.',
    category: 'Voice AI',
    filePath: '/workflows/voice-sales-rep/Appointment_Booking_Functions.json',
    fileName: 'Appointment_Booking_Functions.json',
  },
  {
    name: 'Get Lead Details',
    description: 'Retrieves lead information from GoHighLevel to provide context during voice conversations.',
    category: 'Voice AI',
    filePath: '/workflows/voice-sales-rep/Get_Lead_Details.json',
    fileName: 'Get_Lead_Details.json',
  },
  {
    name: 'Make Outbound Call',
    description: 'Initiates outbound calls through Retell AI to leads in the campaign queue.',
    category: 'Voice AI',
    filePath: '/workflows/voice-sales-rep/Make_Outbound_Call.json',
    fileName: 'Make_Outbound_Call.json',
  },
]

const IMPORT_STEPS = [
  'Download the workflow JSON file using the download button below.',
  'Open your GoHighLevel account and navigate to Automations > Workflows.',
  'Click "Create Workflow" and then select "Import" from the options.',
  'Upload the downloaded JSON file.',
  'Review the imported workflow steps and update any placeholder values (webhook URLs, API keys, etc.) with your actual credentials.',
  'Activate the workflow by toggling it to "Published" status.',
  'Test the workflow by triggering it manually or with a test lead.',
]

const CATEGORY_COLORS: Record<string, string> = {
  Campaigns: 'bg-blue-100 text-blue-700',
  'Knowledge Base': 'bg-purple-100 text-purple-700',
  'Text AI': 'bg-green-100 text-green-700',
  'Voice AI': 'bg-orange-100 text-orange-700',
}

export default function WorkflowImports() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/api">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Workflow Imports</h1>
          <p className="text-muted-foreground">
            Download GoHighLevel workflow JSON files and import them into your account
          </p>
        </div>
      </div>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Import Instructions</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to import workflows into GoHighLevel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {IMPORT_STEPS.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Workflow Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Workflows</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {WORKFLOWS.map((workflow) => (
            <Card key={workflow.filePath} className="flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                  </div>
                  <Badge className={`${CATEGORY_COLORS[workflow.category] ?? 'bg-gray-100 text-gray-700'} text-xs flex-shrink-0`}>
                    {workflow.category}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-muted-foreground">
                    {workflow.fileName}
                  </code>
                  <Button size="sm" variant="outline" asChild>
                    <a href={workflow.filePath} download={workflow.fileName}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
