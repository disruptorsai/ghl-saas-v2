import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Generic webhook proxy to avoid CORS issues.
 * Frontend POSTs { url, body } here, and this function forwards the request server-side.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url, body } = req.body ?? {}

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" in request body' })
  }

  // Only allow proxying to known webhook domains
  const allowed = ['n8n.disruptormedia.dev', 'n8n.disruptorsmedia.dev']
  try {
    const parsed = new URL(url)
    if (!allowed.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain))) {
      return res.status(403).json({ error: 'Domain not allowed' })
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const contentType = response.headers.get('content-type') ?? ''
    let data: unknown
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    return res.status(response.status).json({
      status: response.status,
      data,
    })
  } catch (err) {
    const message = err instanceof Error
      ? (err.name === 'AbortError' ? 'Webhook timed out (30s)' : err.message)
      : 'Unknown error'
    return res.status(502).json({ error: message })
  }
}
