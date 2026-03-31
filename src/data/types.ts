export interface Module {
  id: string
  title: string
  description: string
  thumbnail: string
  order: number
  steps: Step[]
}

export interface Step {
  id: string
  moduleId: string
  title: string
  description: string
  videoUrl?: string | null
  instructions?: string
  type: 'info' | 'setup' | 'config' | 'demo'
  order: number
}

export interface UserProgress {
  [stepId: string]: {
    completed: boolean
    completedAt: string | null
  }
}

export interface Member {
  id: string
  name: string
  avatar: string
  role: string
  company: string
  joinedAt: string
  online: boolean
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface FeedbackAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'loom'
  url: string
  name: string
}

export interface FeedbackItem {
  id: string
  moduleId: string
  stepId: string
  type: 'question' | 'bug' | 'change_request' | 'suggestion' | 'comment'
  priority: 'high' | 'medium' | 'low'
  message: string
  attachments: FeedbackAttachment[]
  createdAt: string
}

export interface AdminClient {
  id: string
  name: string
  company: string
  progress: number
  currentModule: string
  lastActive: string
  daysSinceSignup: number
}
