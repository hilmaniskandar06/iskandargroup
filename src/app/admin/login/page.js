import { getAdminSession } from '@/lib/auth'
import { loginAction, seedDefaultAdminAction } from '../actions'
import { redirect } from 'next/navigation'

export default async function AdminLoginPage(props) {
  const session = await getAdminSession()
  if (session) redirect('/admin')

  const searchParams = await props.searchParams

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: 'white', padding: '40px 32px', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Admin CT Corp</h1>
          <p style={{ color: 'var(--color-gray)' }}>Masuk untuk mengelola konten website</p>
        </div>

        {searchParams?.error === '1' && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.9rem' }}>
            Email atau kata sandi salah. Silakan coba lagi.
          </div>
        )}

        {searchParams?.seeded === '1' && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', background: '#d1fae5', color: '#065f46', fontSize: '0.9rem' }}>
            Admin default berhasil dibuat. Masuk dengan <strong>admin@ctcorp.id</strong> / <strong>admin123</strong>
          </div>
        )}

        {searchParams?.serviceKey === '1' && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.9rem' }}>
            SUPABASE_SERVICE_ROLE_KEY belum valid. Isi key tersebut di .env.local, lalu restart dev server.
          </div>
        )}

        <form action={loginAction}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Alamat Email</label>
            <input name="email" type="email" required defaultValue="admin@ctcorp.id"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Kata Sandi</label>
            <input name="password" type="password" required defaultValue="admin123"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Masuk</button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-gray)' }}>
          <form action={seedDefaultAdminAction} style={{ display: 'inline' }}>
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
              Reset / Buat Admin Default
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
