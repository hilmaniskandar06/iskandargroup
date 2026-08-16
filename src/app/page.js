import prisma from '@/lib/prisma'

export default async function Home() {
  // Try fetching content, provide defaults if db is empty or not seeded
  let content = null;
  let businesses = [];
  let stats = [];

  try {
    content = await prisma.pageContent.findFirst();
    businesses = await prisma.businessCategory.findMany({ orderBy: { order: 'asc' } });
    stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
  } catch (e) {
    console.log("Database not initialized yet, using fallback data.");
  }

  const data = content || {
    homeTitle: 'Untuk Indonesia\nyang lebih baik',
    homeDesc: 'Bisnis Kami',
    homeSubDesc: 'CT Corp adalah konglomerasi terdiversifikasi terkemuka yang berpusat pada konsumen, mempekerjakan lebih dari 100.000 karyawan di seluruh Indonesia.',
    homeHeroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  };

  const defaultBusinesses = [
    { title: 'Layanan Keuangan', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop' },
    { title: 'Media & Hiburan', imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=500&auto=format&fit=crop' },
    { title: 'Perhotelan & Wisata', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop' },
    { title: 'Hiburan & Properti', imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop' },
    { title: 'Ritel & Gaya Hidup', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500&auto=format&fit=crop' },
  ];

  const defaultStats = [
    { value: '100,000+', label: 'KARYAWAN DI SELURUH NEGERI' },
    { value: '55+', label: 'KOTA DI INDONESIA' },
    { value: '35+', label: 'TAHUN PERJALANAN' },
    { value: '200 Juta +', label: 'PELANGGAN SETIA' },
  ];

  const displayBusinesses = businesses.length > 0 ? businesses : defaultBusinesses;
  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <main>
      <section className="hero" style={{ backgroundImage: `url('${data.homeHeroImg}')` }}>
        <div className="hero-content">
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: data.homeTitle.replace(/\n/g, '<br/>') }}></h1>
        </div>
      </section>

      <section className="section container">
        <h2>{data.homeDesc}</h2>
        <p style={{ color: 'var(--color-gray)', marginBottom: 'var(--spacing-xl)', maxWidth: '800px' }}>
          {data.homeSubDesc}
        </p>

        <div className="grid-4">
          {displayBusinesses.map((biz, idx) => {
            const targetHref = biz.linkUrl || '/business';
            const isExternal = targetHref.startsWith('http') || targetHref.startsWith('//');
            return (
              <a
                href={targetHref}
                key={biz.id || idx}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
              >
                <img src={biz.imageUrl} alt={biz.title} />
                <div className="card-content">
                  <h3 className="card-title">{biz.title}</h3>
                  {biz.desc && <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '6px', lineHeight: '1.4' }}>{biz.desc}</p>}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <h2 style={{ color: 'white', opacity: 0.9, textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Kekuatan Kami Dalam Angka</h2>
          <div className="stats-grid">
            {displayStats.map((stat, idx) => (
              <div key={idx} style={{ padding: '20px' }}>
                <div className="stat-value" style={{ color: 'white' }}>{stat.value}</div>
                <div className="stat-label" style={{ color: 'white', opacity: 0.7 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
