import prisma from '@/lib/prisma'

export default async function NewsPage() {
  let items = []
  try {
    items = await prisma.news.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { date: 'desc' }],
    })
  } catch (e) {}

  return (
    <main>
      <section className="section-primary" style={{ padding: '80px 0 60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Berita & Siaran Pers</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85 }}>Pengumuman resmi, siaran pers, dan informasi terkini CT Corp.</p>
        </div>
      </section>

      <section className="section container">
        {items.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', border: '2px dashed var(--color-gray)', borderRadius: '12px', opacity: 0.6 }}>
            <h2 style={{ fontSize: '1.75rem' }}>Belum ada berita</h2>
            <p>Artikel akan segera diterbitkan oleh pengelola web.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {items.map(n => (
              <article key={n.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transition: 'transform .25s' }} className="card">
                {n.imageUrl && <img src={n.imageUrl} alt={n.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />}
                <div style={{ padding: '22px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {new Date(n.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{n.title}</h3>
                  {n.excerpt && <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem', lineHeight: 1.6 }}>{n.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
