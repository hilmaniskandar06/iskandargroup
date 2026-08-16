import prisma from '@/lib/prisma'

export default async function BusinessPage() {
  let categories = []
  let content = null
  try {
    categories = await prisma.businessCategory.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    })
    content = await prisma.pageContent.findFirst()
  } catch (e) {}

  const defaultCategories = [
    {
      id: 1, title: 'Financial Services', items: [
        { id: 1, title: 'Allo Bank', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Allo_Bank_logo.svg/320px-Allo_Bank_logo.svg.png', linkUrl: 'https://www.allobank.com' },
        { id: 2, title: 'Bank Mega', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Bank_Mega_logo.svg/320px-Bank_Mega_logo.svg.png', linkUrl: 'https://www.bankmega.com' },
      ]
    },
    { id: 2, title: 'Media', items: [] },
    { id: 3, title: 'Leisure & Hospitality', items: [] },
    { id: 4, title: 'Entertainment & Property', items: [] },
    { id: 5, title: 'Retail & Lifestyle', items: [] },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <main>
      <section className="section-primary" style={{ padding: '100px 0 60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Bisnis Kami</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '700px' }}>
            {content?.businessText || 'CT Corp beroperasi di berbagai sektor industri strategis di Indonesia.'}
          </p>
        </div>
      </section>

      {/* Category tab pills */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '70px', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px 0' }}>
          {displayCategories.map((cat, idx) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              style={{
                padding: '6px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '999px',
                fontSize: '0.9rem',
                textDecoration: 'none',
                color: '#111',
                background: idx === 0 ? '#111' : 'transparent',
                fontWeight: idx === 0 ? 600 : 400,
                transition: 'all .2s',
              }}
            >
              {cat.title}
            </a>
          ))}
        </div>
      </section>

      {/* Per-category sections */}
      <section className="section container">
        {displayCategories.map(cat => (
          <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '60px' }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{cat.title}</h2>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {/* Brand logo grid — dark background like screenshot */}
            {cat.items && cat.items.length > 0 ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1px',
                background: '#e5e7eb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                {cat.items.map(item => {
                  const isExternal = item.linkUrl && (item.linkUrl.startsWith('http') || item.linkUrl.startsWith('//'))
                  const Tag = item.linkUrl ? 'a' : 'div'
                  return (
                    <Tag
                      key={item.id}
                      href={item.linkUrl || undefined}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      style={{
                        width: 'calc(100% / 6 - 1px)',
                        minWidth: '140px',
                        flex: '0 0 auto',
                        background: '#1a1a2e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '28px 16px',
                        minHeight: '120px',
                        cursor: item.linkUrl ? 'pointer' : 'default',
                        textDecoration: 'none',
                        boxSizing: 'border-box',
                      }}
                      title={item.title}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ maxWidth: '120px', maxHeight: '52px', objectFit: 'contain' }}
                      />
                    </Tag>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: '#aaa', fontStyle: 'italic' }}>Belum ada brand dalam kategori ini.</p>
            )}
          </div>
        ))}
      </section>
    </main>
  )
}
