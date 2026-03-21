import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Parses the default-prompts.md file and seeds empty prompts with default content.
 * Only updates prompts where content IS NULL (never overwrites user customizations).
 */

interface ParsedPrompt {
  id: number
  type: 'text' | 'voice'
  content: string
}

/**
 * Parse the raw CLIENT PROMPTS markdown into individual prompt entries.
 *
 * File structure:
 *   TEXT AI REP / VOICE AI REP  → section dividers (set current type)
 *   /////                        → prompt delimiter
 *   Prompt - N Name              → prompt header (extract id)
 *   Description: ...             → optional (voice prompts), skip this line
 *   Prompt: ...                  → optional prefix on first content line (voice prompts)
 *   [content lines until next ///// or section end]
 */
export function parseDefaultPrompts(raw: string): ParsedPrompt[] {
  const lines = raw.split('\n')
  const results: ParsedPrompt[] = []

  let currentType: 'text' | 'voice' = 'text'
  let currentId: number | null = null
  let contentLines: string[] = []
  let collecting = false

  const flushPrompt = () => {
    if (currentId !== null && collecting) {
      const content = contentLines.join('\n').trim()
      if (content.length > 0) {
        results.push({ id: currentId, type: currentType, content })
      }
    }
    contentLines = []
    collecting = false
    currentId = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Section switch
    if (trimmed === 'TEXT AI REP') {
      flushPrompt()
      currentType = 'text'
      continue
    }
    if (trimmed === 'VOICE AI REP') {
      flushPrompt()
      currentType = 'voice'
      continue
    }

    // Category headers and delimiters — skip but flush
    if (
      trimmed === 'PERSONA PROMPT' ||
      trimmed === 'MAIN AGENT PROMPTS' ||
      trimmed === 'BOOKING PROMPTS' ||
      trimmed === 'BOOKING PROMPT' ||
      /^-{3,}$/.test(trimmed)
    ) {
      continue
    }

    // Prompt delimiter — flush previous
    if (/^\/{3,}$/.test(trimmed)) {
      flushPrompt()
      continue
    }

    // Prompt header: "Prompt - N ..."
    const headerMatch = trimmed.match(/^Prompt\s*-\s*(\d+)/)
    if (headerMatch) {
      flushPrompt()
      const rawId = parseInt(headerMatch[1], 10)

      // Voice "Prompt - 5 Voice Agent 4" is actually slot 4 in our schema
      if (currentType === 'voice' && trimmed.includes('Voice Agent 4')) {
        currentId = 4
      } else {
        currentId = rawId
      }
      collecting = true
      continue
    }

    // Collect content lines
    if (collecting) {
      // Skip "Description: ..." lines (voice prompts have these)
      if (contentLines.length === 0 && trimmed.startsWith('Description:')) {
        continue
      }
      // Strip "Prompt: " prefix from first content line if present
      if (contentLines.length === 0 && trimmed.startsWith('Prompt: ')) {
        contentLines.push(line.replace(/^(\s*)Prompt:\s*/, '$1'))
        continue
      }
      contentLines.push(line)
    }
  }

  // Flush last prompt
  flushPrompt()

  return results
}

/**
 * Seed default content into prompts that have no content yet.
 * Only updates rows where content IS NULL — never overwrites existing content.
 */
export async function seedDefaultPrompts(
  clientDb: SupabaseClient,
  emptyPrompts: { id: number; prompt_type: 'text' | 'voice' }[],
) {
  if (emptyPrompts.length === 0) return 0

  // Lazy-load the raw markdown to avoid bundling it unless needed
  const { default: rawContent } = await import('../data/default-prompts.md?raw')
  const defaults = parseDefaultPrompts(rawContent)

  let seeded = 0
  for (const empty of emptyPrompts) {
    const match = defaults.find(
      (d) => d.id === empty.id && d.type === empty.prompt_type,
    )
    if (!match) continue

    const { error } = await clientDb
      .from('prompts')
      .update({ content: match.content, is_active: true })
      .eq('id', empty.id)
      .eq('prompt_type', empty.prompt_type)
      .is('content', null) // safety: only if still null

    if (!error) seeded++
  }

  return seeded
}
