import { getPageContent, listBusinessCategories } from '@/lib/db'

export default async function WhoWeAre() {
  let content = null;
  let businesses = [];
  try {
    content = await getPageContent();
    businesses = await listBusinessCategories({ withItems: true });
  } catch (e) {
    // default
  }

  const text = content?.whoWeAreText || "CT Corp didirikan oleh Prof. Dr. (H.C.) Chairul Tanjung, bermula dari sebuah bisnis skala kecil yang kini telah bertransformasi menjadi salah satu konglomerasi bisnis terbesar dan paling terintegrasi di Indonesia.\n\nSaat ini, CT Corp adalah ekosistem terdiversifikasi terkemuka di Indonesia yang mempekerjakan lebih dari 100.000 karyawan. Dengan fokus utama pada kebutuhan konsumen, grup ini memegang posisi kepemimpinan dalam pilar bisnis utama: Layanan Keuangan, Media & Hiburan, Ritel & Gaya Hidup, serta Perhotelan dan Sumber Daya Alam.\n\nCT Corp merupakan induk perusahaan dari Mega Corpora, Trans Corpora, dan CT Global Resources. Kami berkomitmen untuk terus berinovasi dan memberikan dampak positif bagi kemajuan bangsa Indonesia melalui inisiatif bisnis berkelanjutan dan Corporate Social Responsibility (CSR).";
  const founderImg = content?.whoWeAreImg || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop";

  return (
    <main>
      <section className="section-primary" style={{ padding: '80px 0 60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Tentang Kami</h1>
        </div>
      </section>

      <section className="section container">
        {/* Founder / About section */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '60px' }}>
          <img src={founderImg} alt="Founder" style={{ borderRadius: '4px', width: '300px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-gray)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{text}</p>
          </div>
        </div>

        {/* Business & Brand sections */}
        {businesses.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Bisnis &amp; Ekosistem Kami</h2>
            <p style={{ color: 'var(--color-gray)', marginBottom: '40px', maxWidth: '700px' }}>
              CT Corp hadir di berbagai sektor strategis. Klik logo brand untuk mengunjungi situs resminya.
            </p>

            {businesses.map(cat => {
              const hasItems = cat.items && cat.items.length > 0
              return (
                <div key={cat.id} style={{ marginBottom: '48px' }}>
                  {/* Category header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{cat.title}</h3>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  </div>

                  {/* Brand logo gallery */}
                  {hasItems ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
                      gap: '12px',
                    }}>
                      {cat.items.map(item => {
                        const isExt = item.linkUrl && (item.linkUrl.startsWith('http') || item.linkUrl.startsWith('//'))
                        const Tag = item.linkUrl ? 'a' : 'div'
                        return (
                          <Tag
                            key={item.id}
                            href={item.linkUrl || undefined}
                            target={isExt ? '_blank' : undefined}
                            rel={isExt ? 'noopener noreferrer' : undefined}
                            style={{
                              aspectRatio: '1 / 1',
                              background: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '18px',
                              cursor: item.linkUrl ? 'pointer' : 'default',
                              textDecoration: 'none',
                              boxSizing: 'border-box',
                            }}
                            title={item.title}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Tag>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>Belum ada brand.</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  );
}
