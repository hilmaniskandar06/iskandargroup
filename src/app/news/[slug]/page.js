import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  try {
    const items = await prisma.news.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return items.map(n => ({ slug: n.slug }))
  } catch {
    return []
  }
}

export default async function NewsDetailPage({ params }) {
  // support Next 15+ (params is Promise) and 14-
  const resolvedParams = params && typeof params.then === 'function' ? await params : params
  const { slug } = resolvedParams

  let item = null
  try {
    item = await prisma.news.findUnique({ where: { slug } })
  } catch (e) {}

  if (!item || !item.published) notFound()

  return (
    <main>
      <section style={{ padding: '60px 0 30px 0', background: 'var(--color-primary)' }}>
        <div className="container">
          <Link href="/news" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>← Back to News</Link>
          <h1 style={{ fontSize: '2.5rem', marginTop: '20px', marginBottom: '10px' }}>{item.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
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
            <p style={{ color: 'var(--color-gray)' }}>Full article content will be published soon.</p>
          )}
        </article>
      </section>
    </main>
  )
}
