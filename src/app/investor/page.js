export default function InvestorPage() {
  return (
    <main>
      <section className="section-primary" style={{ padding: '100px 0 60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Hubungan Investor</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '700px' }}>
            Informasi keterbukaan, laporan keuangan, dan hubungan investor CT Corp.
          </p>
        </div>
      </section>

      <section className="section container">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ padding: '60px 40px', textAlign: 'center', border: '2px dashed var(--color-gray)', borderRadius: '12px', opacity: 0.6 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Segera Hadir</h2>
            <p>Laporan dan dokumen resmi akan segera dipublikasikan oleh pengelola.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
