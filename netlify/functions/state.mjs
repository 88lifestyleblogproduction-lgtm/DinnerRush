// Per-user app data. Only the signed-in user can read or write their own record.
import { getUser } from '@netlify/identity'
import { getStore } from '@netlify/blobs'

const MAX_STATE = 2_000_000 // characters
const MAX_IMAGE = 6_500_000 // characters (floor-plan image as data URL)

export default async (req) => {
  const user = await getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Optional allowlist: set ALLOWED_EMAILS in Netlify (comma-separated) to limit who can use storage.
  const allow = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (allow.length && !allow.includes(String(user.email || '').toLowerCase())) return new Response('Forbidden', { status: 403 })

  const store = getStore({ name: 'dinnerrush', consistency: 'strong' })
  const key = `users/${user.id}`

  if (req.method === 'GET') {
    const state = (await store.get(`${key}/state`, { type: 'json' })) || {}
    const out = { v: state.v || 0, dev: state.dev || '', s: state.s || null, bgv: state.bgv || null }
    if (new URL(req.url).searchParams.get('bg')) out.bg = (await store.get(`${key}/bg`, { type: 'text' })) || ''
    return Response.json(out, { headers: { 'cache-control': 'no-store' } })
  }

  if (req.method === 'PUT') {
    // Same-origin JSON only (blocks cross-site form posts riding the session cookie).
    const origin = req.headers.get('origin')
    if (origin && origin !== new URL(req.url).origin) return new Response('Forbidden', { status: 403 })
    if (!(req.headers.get('content-type') || '').includes('application/json')) return new Response('Unsupported Media Type', { status: 415 })
    let body
    try { body = await req.json() } catch { return new Response('Bad Request', { status: 400 }) }
    if (typeof body.s !== 'string' || body.s.length > MAX_STATE) return new Response('Bad Request', { status: 400 })
    const prev = (await store.get(`${key}/state`, { type: 'json' })) || {}
    let bgv = prev.bgv || null
    if (typeof body.bg === 'string') {
      if (body.bg.length > MAX_IMAGE) return new Response('Payload Too Large', { status: 413 })
      await store.set(`${key}/bg`, body.bg)
      bgv = Number(body.bgv) || Date.now()
    }
    await store.setJSON(`${key}/state`, { v: Number(body.v) || Date.now(), dev: String(body.dev || '').slice(0, 40), s: body.s, bgv, updatedAt: new Date().toISOString() })
    return Response.json({ ok: true, bgv })
  }

  return new Response('Method Not Allowed', { status: 405 })
}

export const config = { path: '/api/state' }
