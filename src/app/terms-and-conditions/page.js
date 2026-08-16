import prisma from '@/lib/prisma'

export default async function TermsAndConditions() {
  let content = null;
  try {
    content = await prisma.pageContent.findFirst();
  } catch (e) {
    // default
  }

  const text = content?.termsText || `Legal Notices\n\nThis web site is provided by CT Corp and may be used for informational purposes only. By using the site or downloading materials from the site, you agree to abide by the terms and conditions set forth in this notice. If you do not agree to abide by these terms and conditions do not use the site or download materials from the site.\n\nLimited License\nSubject to the terms and conditions set forth in this Agreement, CT Corp grants you a non-exclusive, non-transferable, limited right to access, use and display this site and the materials thereon. You agree not to interrupt or attempt to interrupt the operation of the site in any way.`;

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
