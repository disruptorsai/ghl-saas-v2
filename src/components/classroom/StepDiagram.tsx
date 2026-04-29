// Auto-discovers step images placed in src/assets/steps/<step-id>.{png,jpg,jpeg,webp}.
// To add a new image: drop a file with the matching step ID as its filename — no code change required.

const stepImages = import.meta.glob('/src/assets/steps/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const imageMap: Record<string, string> = {}
for (const [path, url] of Object.entries(stepImages)) {
  const filename = path.split('/').pop()?.replace(/\.[^/.]+$/, '')
  if (filename) imageMap[filename] = url
}

interface StepDiagramProps {
  stepId: string
  title: string
}

export function StepDiagram({ stepId, title }: StepDiagramProps) {
  const url = imageMap[stepId]
  if (!url) return null
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-muted border">
      <img src={url} alt={title} className="w-full h-full object-cover" />
    </div>
  )
}

export function hasStepDiagram(stepId: string): boolean {
  return stepId in imageMap
}
