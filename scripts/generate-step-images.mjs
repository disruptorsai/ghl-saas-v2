import { writeFile, readFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const envMap = {}
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) envMap[m[1]] = m[2].trim()
}
const API_KEY = envMap.KIE_AI_API_KEY
if (!API_KEY) throw new Error('KIE_AI_API_KEY not set in .env')

const STYLE = `Premium editorial dark-mode infographic illustration designed as a 16:9 video-thumbnail, deep matte-black background (#050505) with a subtle radial vignette and faint film-grain texture, glassmorphic translucent panels with thin cream-tinted borders (1px, ~10% opacity) and a soft top-edge cream highlight suggesting glass, cream-colored line icons (#F0EDE6) at roughly 60-70% opacity with 1.5px stroke weight and rounded line caps, gold accent (#C9A84C) used sparingly only for focal status dots, glows, hero icons, checkmarks and arrowheads — never as a background or large fill, soft warm gold halo glows around accent elements, generous negative space, luxurious editorial SaaS aesthetic, high-end vector line-art, no photorealism, NO text or letters or numbers anywhere in the image, brand: Disruptors Media (dark luxury, editorial premium, gold-on-black).`

const STEPS = [
  {
    id: 'welcome-2',
    prompt: 'Hero composition for a course thumbnail. A large central AI brain icon glowing softly with a warm gold halo on a deep black canvas. Seven cream line-icons (phone receiver, chat bubble, calendar, envelope, five-point star, database cylinder, microphone) arc above and around the brain like satellites, each connected by thin cream lines tipped with tiny gold arrowheads. Far left: a small cream silhouette of a person with a subtle inbound line. Far right: a glassmorphic calendar card with a gold checkmark badge. Conveys orchestrated intelligence.',
  },
  {
    id: 'welcome-3',
    prompt: 'Wide horizontal thumbnail timeline on a deep black canvas. Five small glassmorphic milestone cards spaced along a thin cream curving path: a settings gear, a sliders icon, a magnifying glass, a rocket, and an upward trending graph. The rocket card has a soft warm gold trailing glow. Tiny cream progress dots between milestones. Conveys momentum, premium editorial onboarding journey.',
  },
  {
    id: 'api-setup-3',
    prompt: 'Four glassmorphic cards in a row across a deep black canvas, each with a cream line icon and thin cream-tinted borders, connected by hairline cream lines tipped with tiny gold arrowheads. Card 1: person-plus silhouette. Card 2: credit card with a gold checkmark. Card 3 (the hero): a key icon with a glowing gold halo. Card 4: a clipboard inserting into an abstract platform box. Premium dark editorial.',
  },
  {
    id: 'api-setup-4',
    prompt: 'Three glassmorphic cards in a row across a deep black canvas with cream line icons. Card 1: a profile silhouette beside a microphone. Card 2: a stack of voice waveform lines. Card 3 (the hero): a key icon with concentric sound waves emanating outward, surrounded by a soft gold halo. Premium dark editorial.',
  },
  {
    id: 'api-setup-5',
    prompt: 'Hero composition on a deep black canvas. A central luminous gold-haloed hub icon. Four glassmorphic node cards positioned at the corners (CRM box, chat bubble, microphone, phone receiver), each connected to the central hub by softly glowing cream lines. Each corner node has a small gold checkmark badge. Premium dark editorial — system fully connected.',
  },
  {
    id: 'twilio-setup-2',
    prompt: 'Three glassmorphic cards in a row across a deep black canvas with cream line icons. Card 1: a document with an official stamp (verification). Card 2: a phone receiver with a stylized number badge. Card 3 (the hero): a plug connecting into an abstract platform box, with a soft gold halo. Premium dark editorial.',
  },
  {
    id: 'twilio-setup-3',
    prompt: 'Composition on a deep black canvas. A glassmorphic calendar card on the left with one date highlighted by a soft gold halo. Beside it, a soft cream clock face. To the right, a small cream headshot avatar inside a glassmorphic circle with a chat bubble. Conveys a friendly 1-on-1 booking. Premium dark editorial.',
  },
  {
    id: 'voice-receptionist-2',
    prompt: 'Wide thumbnail composition on a deep black canvas. Far left: an inbound phone receiver with a small pulsing gold notification dot. Center hero: an AI bot avatar with concentric sound waves and a soft gold halo. Right: branching gracefully into three small glassmorphic cards — a calendar (book appointment), a database cylinder (route to team), and a voicemail tape icon (after-hours capture). Premium dark editorial.',
  },
  {
    id: 'voice-receptionist-4',
    prompt: 'Composition on a deep black canvas. Two soft glassmorphic chat bubbles arcing between a cream silhouette of a customer on the left and a cream silhouette of a headset-wearing CSM agent on the right. The customer bubble has a gold-tinted border, the agent bubble has a cream-tinted border. A subtle microphone glyph as a soft glow watermark in the bottom corner. Warm, premium, dark editorial.',
  },
  {
    id: 'voice-receptionist-5',
    prompt: 'Composition on a deep black canvas. A glassmorphic clipboard card on the left with five neatly checked rows (each checkmark drawn in gold). On the right (the hero): a glowing gold ribbon medal with a warm gold halo and a few tiny gold confetti particles drifting around it. A subtle microphone glyph as a watermark in the corner. Premium celebratory dark editorial — completion moment.',
  },
  {
    id: 'db-reactivation-2',
    prompt: 'Wide thumbnail composition on a deep black canvas. Far left: a glassmorphic database cylinder containing small cream silhouettes of dormant leads. Center hero: a gold-haloed funnel with thin cream filter lines, leads flowing through and being segmented. Right: a cream AI bot avatar sending three small staggered chat-bubble SMS messages. Far right: a small glassmorphic calendar card with a gold checkmark. Premium dark editorial — reactivation pipeline.',
  },
  {
    id: 'db-reactivation-4',
    prompt: 'Composition on a deep black canvas. Two soft glassmorphic chat bubbles arcing between a cream silhouette of a customer on the left and a cream silhouette of a headset-wearing CSM on the right. Customer bubble has a gold-tinted border, CSM bubble has a cream-tinted border. A subtle database cylinder glyph as a soft gold-glow watermark in the bottom corner. Warm, premium, dark editorial.',
  },
  {
    id: 'db-reactivation-5',
    prompt: 'Composition on a deep black canvas. A glassmorphic clipboard card on the left with five neatly checked rows (gold checkmarks). On the right (the hero): a glowing gold ribbon medal with a warm gold halo and a few tiny gold confetti particles. A subtle database cylinder glyph as a soft watermark in the corner. Premium celebratory dark editorial.',
  },
  {
    id: 'lead-followup-2',
    prompt: 'Wide thumbnail composition on a deep black canvas. Far left: a cream silhouette of a fresh new lead with a small gold notification glow. Center: a gold-haloed clock face indicating a 5-minute mark. To its right: a cream AI bot avatar sending three small staggered chat-bubble messages over time. Far right: a thin upward-trending arrow leading into a glassmorphic "converted" tag with a gold checkmark. Premium dark editorial — fast follow-up.',
  },
  {
    id: 'lead-followup-4',
    prompt: 'Composition on a deep black canvas. Two soft glassmorphic chat bubbles arcing between a cream customer silhouette on the left and a cream headset CSM silhouette on the right. Customer bubble has a gold-tinted border, CSM bubble has a cream-tinted border. A subtle clock face glyph as a soft gold-glow watermark in the bottom corner. Warm, premium, dark editorial.',
  },
  {
    id: 'lead-followup-5',
    prompt: 'Composition on a deep black canvas. A glassmorphic clipboard card with five gold checkmarks on the left. On the right (the hero): a glowing gold ribbon medal with a warm gold halo and a few tiny gold confetti particles. A subtle clock face glyph as a soft watermark in the corner. Premium celebratory dark editorial.',
  },
  {
    id: 'appointment-reminders-2',
    prompt: 'Wide thumbnail composition on a deep black canvas. Far left: a glassmorphic calendar card with one date circled by a soft gold halo. Center: two cream clock icons (representing 24h and 1h before) each with a small gold bell-notification dot. Right: branching gracefully into two outcome cards — a glassmorphic card with a gold checkmark (confirmed) and a glassmorphic card with a curved calendar-arrow (rescheduled). Premium dark editorial — appointment automation.',
  },
  {
    id: 'appointment-reminders-4',
    prompt: 'A deep black canvas. On the left, a cream-line silhouette of a customer with a soft glassmorphic chat bubble (gold-tinted border). On the right, a cream-line silhouette of a customer-success agent wearing a headset, with a soft glassmorphic chat bubble (cream-tinted border). Two thin connecting arcs between the bubbles. In the bottom corner, a calendar glyph rendered as a faint gold glow watermark. Warm, supportive, premium dark editorial.',
  },
  {
    id: 'appointment-reminders-5',
    prompt: 'Composition on a deep black canvas. A glassmorphic clipboard card with five gold checkmarks on the left. On the right (the hero): a glowing gold ribbon medal with a warm gold halo and a few tiny gold confetti particles. A subtle calendar glyph as a soft watermark in the corner. Premium celebratory dark editorial.',
  },
  {
    id: 'quote-followup-1',
    prompt: 'A deep black canvas with a centered hero composition. A glassmorphic chart panel showing two simple cream rectangle bars rising at different heights, the taller right-hand bar capped with a glowing gold currency emblem surrounded by a warm gold halo. In the foreground, a glassmorphic document card with a small gold price tag clipped to its corner. Premium dark editorial style suggesting revenue uplift.',
  },
]

const OUT_DIR = resolve(ROOT, 'src/assets/steps')
await mkdir(OUT_DIR, { recursive: true })

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function createTask(prompt) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2-text-to-image',
      input: {
        prompt: `${STYLE}\n\n${prompt}`,
        aspect_ratio: '16:9',
        resolution: '2K',
      },
    }),
  })
  const data = await res.json()
  if (data.code !== 200) {
    throw new Error(`createTask error ${data.code}: ${data.msg ?? JSON.stringify(data)}`)
  }
  return data.data.taskId
}

async function pollTask(taskId, { intervalMs = 5000, maxMs = 6 * 60 * 1000 } = {}) {
  const start = Date.now()
  let last = ''
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, intervalMs))
    const res = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${API_KEY}` } },
    )
    const data = await res.json()
    if (data.code !== 200) {
      throw new Error(`recordInfo error ${data.code}: ${data.msg ?? JSON.stringify(data)}`)
    }
    const state = data.data?.state
    if (state !== last) {
      process.stdout.write(`  state=${state}\n`)
      last = state
    }
    if (state === 'success') {
      const resultJson = JSON.parse(data.data.resultJson)
      const url = resultJson.resultUrls?.[0]
      if (!url) throw new Error(`No resultUrls in resultJson: ${data.data.resultJson}`)
      return url
    }
    if (state === 'fail') {
      throw new Error(`Task failed: ${data.data.failMsg ?? data.data.failCode ?? 'unknown'}`)
    }
  }
  throw new Error(`Polling timed out after ${maxMs}ms`)
}

async function downloadImage(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(outPath, buf)
}

function pickExtension(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = extname(pathname).toLowerCase()
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return ext
  } catch {}
  return '.png'
}

const results = []
for (const step of STEPS) {
  // Skip if any supported extension already exists
  const existingExts = ['.png', '.jpg', '.jpeg', '.webp']
  const existing = (
    await Promise.all(
      existingExts.map(async (e) => ((await fileExists(resolve(OUT_DIR, `${step.id}${e}`))) ? e : null)),
    )
  ).filter(Boolean)
  if (existing.length > 0) {
    console.log(`[${step.id}] already exists (${existing[0]}), skipping`)
    results.push({ id: step.id, status: 'skipped' })
    continue
  }

  console.log(`[${step.id}] creating task...`)
  try {
    const taskId = await createTask(step.prompt)
    console.log(`[${step.id}] taskId=${taskId}`)
    const url = await pollTask(taskId)
    const ext = pickExtension(url)
    const outPath = resolve(OUT_DIR, `${step.id}${ext}`)
    console.log(`[${step.id}] downloading -> ${outPath}`)
    await downloadImage(url, outPath)
    console.log(`[${step.id}] saved`)
    results.push({ id: step.id, status: 'ok', path: outPath })
  } catch (err) {
    console.error(`[${step.id}] FAILED: ${err.message}`)
    results.push({ id: step.id, status: 'failed', error: err.message })
  }
}

console.log('\n=== Summary ===')
for (const r of results) {
  console.log(`  ${r.id}: ${r.status}${r.error ? ' — ' + r.error : ''}`)
}
const failed = results.filter((r) => r.status === 'failed').length
if (failed > 0) process.exitCode = 1
