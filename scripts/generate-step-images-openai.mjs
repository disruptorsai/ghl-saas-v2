import { writeFile, readFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const envText = await readFile(resolve(ROOT, '.env'), 'utf8')
const envMap = {}
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) envMap[m[1]] = m[2].trim()
}
const API_KEY = envMap.OPENAI_API_KEY
if (!API_KEY) throw new Error('OPENAI_API_KEY not set in .env')

const STYLE = `Premium editorial dark-mode infographic illustration designed as a 16:9 video-thumbnail, deep matte-black background (#050505) with a subtle radial vignette and faint film-grain texture, glassmorphic translucent panels with thin cream-tinted borders (1px, ~10% opacity) and a soft top-edge cream highlight suggesting glass, cream-colored line icons (#F0EDE6) at roughly 60-70% opacity with 1.5px stroke weight and rounded line caps, gold accent (#C9A84C) used sparingly only for focal status dots, glows, hero icons, checkmarks and arrowheads — never as a background or large fill, soft warm gold halo glows around accent elements, generous negative space, luxurious editorial SaaS aesthetic, high-end vector line-art, no photorealism, NO text or letters or numbers anywhere in the image, brand: Disruptors Media (dark luxury, editorial premium, gold-on-black).`

const STEPS = [
  {
    id: 'quote-followup-2',
    prompt: 'Wide thumbnail composition on a deep black canvas. Far left: a glassmorphic quote document card with a small gold dollar emblem clipped to its corner. Next: a cream clock face indicating wait time. Center: a cream AI bot avatar with a soft gold halo. Right: a glassmorphic chat bubble holding a gold checkmark glyph (objection handled). Far right: a glowing gold "won" badge with a warm halo. Premium dark editorial — automated quote follow-up.',
  },
  {
    id: 'quote-followup-3',
    prompt: 'Hero composition on a deep black canvas. A central glassmorphic document template card with cream-line placeholder rows representing editable text fields, each row marked with a small gold edit-pencil icon. Floating at the corners: small cream tool glyphs — a paintbrush, a dropdown selector, a toggle switch. A faint gold halo behind the template. Premium dark editorial — template customization moment.',
  },
  {
    id: 'quote-followup-4',
    prompt: 'A deep black canvas. On the left, a cream-line silhouette of a customer with a soft glassmorphic chat bubble (gold-tinted border). On the right, a cream-line silhouette of a customer-success agent wearing a headset, with a soft glassmorphic chat bubble (cream-tinted border). Two thin connecting arcs between the bubbles. In the bottom corner, a small price-tag glyph rendered as a faint gold glow watermark. Warm, supportive, premium dark editorial.',
  },
  {
    id: 'quote-followup-5',
    prompt: 'Composition on a deep black canvas. A glassmorphic clipboard card with five gold checkmarks on the left. On the right (the hero): a glowing gold ribbon medal with a warm halo and a few tiny gold confetti particles. A subtle price-tag glyph as a soft watermark in the corner. Premium celebratory dark editorial.',
  },
]

const OUT_DIR = resolve(ROOT, 'src/assets/steps')
await mkdir(OUT_DIR, { recursive: true })

async function fileExists(p) {
  try { await access(p); return true } catch { return false }
}

async function generate(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `${STYLE}\n\n${prompt}`,
      size: '1536x1024',
      quality: 'high',
      n: 1,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 500)}`)
  }
  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error(`No b64_json in response: ${JSON.stringify(data).slice(0, 300)}`)
  return Buffer.from(b64, 'base64')
}

const results = []
for (const step of STEPS) {
  const outPath = resolve(OUT_DIR, `${step.id}.png`)
  if (await fileExists(outPath)) {
    console.log(`[${step.id}] already exists, skipping`)
    results.push({ id: step.id, status: 'skipped' })
    continue
  }
  console.log(`[${step.id}] generating via OpenAI gpt-image-1...`)
  try {
    const buf = await generate(step.prompt)
    await writeFile(outPath, buf)
    console.log(`[${step.id}] saved`)
    results.push({ id: step.id, status: 'ok' })
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
