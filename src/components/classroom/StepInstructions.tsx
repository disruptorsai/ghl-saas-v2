interface StepInstructionsProps {
  instructions: string
}

export function StepInstructions({ instructions }: StepInstructionsProps) {
  const lines = instructions.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let checklistItems: React.ReactNode[] = []

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1.5 pl-1">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  function flushChecklist() {
    if (checklistItems.length > 0) {
      elements.push(
        <div key={`cl-${elements.length}`} className="space-y-1.5">
          {checklistItems}
        </div>
      )
      checklistItems = []
    }
  }

  function renderInline(text: string): React.ReactNode {
    // Handle **bold** spans
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line — flush and add break
    if (trimmed === '') {
      flushList()
      flushChecklist()
      continue
    }

    // H2 or H3 headings
    if (trimmed.startsWith('### ')) {
      flushList()
      flushChecklist()
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-foreground text-base mt-2">
          {renderInline(trimmed.slice(4))}
        </h3>
      )
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      flushChecklist()
      elements.push(
        <h3 key={`h2-${i}`} className="font-bold text-foreground text-lg mt-2">
          {renderInline(trimmed.slice(3))}
        </h3>
      )
      continue
    }

    // Checklist items
    if (trimmed.startsWith('✅') || trimmed.startsWith('☐')) {
      flushList()
      const isChecked = trimmed.startsWith('✅')
      const text = trimmed.slice(isChecked ? 1 : 1).trim()
      checklistItems.push(
        <div key={`check-${i}`} className="flex items-start gap-2 text-sm">
          <span className="mt-0.5">{isChecked ? '✅' : '☐'}</span>
          <span className="text-muted-foreground">{renderInline(text)}</span>
        </div>
      )
      continue
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushChecklist()
      const text = trimmed.slice(2)
      listItems.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-primary mt-1.5 shrink-0 h-1 w-1 rounded-full bg-primary inline-block" />
          <span>{renderInline(text)}</span>
        </li>
      )
      continue
    }

    // Regular paragraph
    flushList()
    flushChecklist()
    elements.push(
      <p key={`p-${i}`} className="text-sm text-muted-foreground">
        {renderInline(trimmed)}
      </p>
    )
  }

  // Flush remaining
  flushList()
  flushChecklist()

  return (
    <div className="space-y-3 leading-relaxed text-foreground">
      {elements}
    </div>
  )
}
