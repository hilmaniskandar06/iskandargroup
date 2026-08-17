import { getCsrBySlug, listCsrSlugs } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  try {
    const items = await listCsrSlugs()
    return items.map(c => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export default async function CsrDetailPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params
  const { slug } = resolvedParams

  let item = null
  try {
    item = await getCsrBySlug(slug)
  } catch (e) {}

  if (!item) notFound()

  return (
    <main>
      <section style={{ padding: '60px 0 30px 0', background: 'var(--color-primary)' }}>
        <div className="container">
          <Link href="/csr" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>← Back to CSR</Link>
          <h1 style={{ fontSize: '2.5rem', marginTop: '20px', marginBottom: '10px' }}>{item.title}</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {item.category && <span style={{ display: 'inline-block', padding: '4px 14px', background: 'var(--color-secondary)', color: 'white', fontSize: '0.8rem', fontWeight: 600, borderRadius: '999px' }}>{item.category}</span>}
            <p style={{ color: 'rgba(255,255,255,0.8)', alignSelf: 'center' }}>
              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {item.imageUrl && (
        <section className="section container" style={{ paddingTop: '40px', paddingBottom: '10px' }}>
          <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxHeight: '460px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }} />
        </section>
      )}

      <section className="section container" style={{ paddingTop: '20px' }}>
        <article style={{ maxWidth: '820px', margin: '0 auto' }}>
          {item.excerpt && (
            <p style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 500, lineHeight: 1.6, marginBottom: '30px' }}>{item.excerpt}</p>
          )}
          {item.content ? (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: 1.8, color: '#333' }}>{item.content}</div>
          ) : (
            <p style={{ color: 'var(--color-gray)' }}>Full program details will be published soon.</p>
          )}
        </article>
      </section>
    </main>
  )
}
