import { listCsrPrograms } from '@/lib/db'

export default async function CSRPage() {
  let items = []
  try {
    items = await listCsrPrograms()
  } catch (e) {}

  return (
    <main>
      <section className="section-primary" style={{ padding: '80px 0 60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Tanggung Jawab Sosial (CSR)</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85 }}>Komitmen CT Corp dalam menciptakan dampak positif berkelanjutan bagi masyarakat dan lingkungan.</p>
        </div>
      </section>

      <section className="section container">
        {items.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', border: '2px dashed var(--color-gray)', borderRadius: '12px', opacity: 0.6 }}>
            <h2 style={{ fontSize: '1.75rem' }}>Belum ada program CSR</h2>
            <p>Program akan segera diterbitkan oleh pengelola web.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {items.map(c => (
              <article key={c.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                {c.imageUrl && <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />}
                <div style={{ padding: '24px' }}>
                  {c.category && <span style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--color-secondary)', color: 'white', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px', marginBottom: '12px' }}>
                    {c.category}
                  </span>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '8px' }}>
                    {new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{c.title}</h3>
                  {c.excerpt && <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem', lineHeight: 1.6 }}>{c.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
