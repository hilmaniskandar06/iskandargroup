import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE = 'ctcorp_admin_session'
const SECRET = process.env.SESSION_SECRET || 'ctcorp-dev-secret-change-me'

export function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(token) {
  try {
    const [data, sig] = token.split('.')
    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(data)
      .digest('base64url')
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}

export async function setAdminSession(user) {
  const token = signSession({ id: user.id, email: user.email, role: user.role, name: user.name || user.email })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireAuth() {
  const session = await getAdminSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}
