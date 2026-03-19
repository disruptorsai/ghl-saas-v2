import { PlayCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string | null
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (videoUrl) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        <iframe
          src={videoUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-xl bg-muted relative flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

      <PlayCircle className="h-16 w-16 text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground font-medium text-sm">
        Video Coming Soon
      </p>
      <p className="text-muted-foreground/60 text-xs mt-1">{title}</p>
    </div>
  )
}
