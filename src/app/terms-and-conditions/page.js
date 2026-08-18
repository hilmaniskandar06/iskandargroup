import { getPageContent } from '@/lib/db'

export default async function TermsAndConditions() {
  let content = null;
  try {
    content = await getPageContent();
  } catch (e) {
    // default
  }

  const text = content?.termsText || `Pemberitahuan Hukum\n\nSitus web ini disediakan oleh PT. Iskandar Group Indonesia untuk keperluan informasi. Dengan menggunakan situs ini atau mengunduh materi dari situs ini, Anda menyetujui untuk mematuhi syarat dan ketentuan yang tercantum dalam pemberitahuan ini. Jika Anda tidak setuju dengan syarat dan ketentuan ini, jangan gunakan situs ini atau unduh materi dari situs ini.\n\nLisensi Terbatas\nDengan tunduk pada syarat dan ketentuan yang tercantum dalam perjanjian ini, PT. Iskandar Group Indonesia memberikan Anda lisensi non-eksklusif, tidak dapat dialihkan, dan terbatas untuk mengakses, menggunakan, dan menampilkan situs ini beserta materi yang ada di dalamnya. Anda setuju untuk tidak mengganggu atau mencoba mengganggu operasi situs ini dengan cara apa pun.`;

  return (
    <main>
      <section className="section-primary" style={{ padding: '150px 0 80px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Syarat & Ketentuan</h1>
        </div>
      </section>
      
      <section className="section container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
          {text}
        </div>
      </section>
    </main>
  );
}
