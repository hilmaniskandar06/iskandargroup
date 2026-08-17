import { getPageContent, listBusinessCategories, listStats } from '@/lib/db'

export default async function Home() {
  let content = null;
  let businesses = [];
  let stats = [];

  try {
    content = await getPageContent();
    businesses = await listBusinessCategories();
    stats = await listStats();
  } catch (e) {}

  const data = content || {
    homeTitle: 'Untuk Indonesia\nyang lebih baik',
    homeDesc: 'Bisnis Kami',
    homeSubDesc: 'CT Corp adalah konglomerasi terdiversifikasi terkemuka yang berpusat pada konsumen, mempekerjakan lebih dari 100.000 karyawan di seluruh Indonesia.',
    homeHeroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  };

  const displayStats = stats.length > 0 ? stats : [
    { value: '100,000+', label: 'KARYAWAN DI SELURUH NEGERI' },
    { value: '55+', label: 'KOTA DI INDONESIA' },
    { value: '35+', label: 'TAHUN PERJALANAN' },
    { value: '200 Juta +', label: 'PELANGGAN SETIA' },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="hero" style={{ backgroundImage: `url('${data.homeHeroImg}')` }}>
        <div className="hero-content">
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: data.homeTitle.replace(/\n/g, '<br/>') }}></h1>
        </div>
      </section>

      {/* Business categories */}
      {businesses.length > 0 && (
        <section className="section container">
          <h2>{data.homeDesc || 'Bisnis Kami'}</h2>
          <p style={{ color: 'var(--color-gray)', marginBottom: 'var(--spacing-xl)', maxWidth: '800px' }}>
            {data.homeSubDesc}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {businesses.map((biz) => (
              <a
                href="/business"
                key={biz.id}
                aria-label={biz.title}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', transition: 'transform .2s, box-shadow .2s', background: '#111' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#111' }}>
                  {biz.imageUrl
                    ? <img src={biz.imageUrl} alt={biz.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 700 }}>{biz.title.charAt(0)}</div>
                  }
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      <section
        className="stats-section"
        style={data.statsBgImg ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url('${data.statsBgImg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="container">
          <div className="stats-grid">
            {displayStats.map((stat, i) => (
              <div key={stat.id || i} className="stat-item">
                <div className="stat-value" style={data.statsBgImg ? { color: '#fff' } : undefined}>{stat.value}</div>
                <div className="stat-label" style={data.statsBgImg ? { color: 'rgba(255,255,255,0.82)' } : undefined}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
