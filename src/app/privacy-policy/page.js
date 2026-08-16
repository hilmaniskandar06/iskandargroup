import prisma from '@/lib/prisma'

export default async function PrivacyPolicy() {
  let content = null;
  try {
    content = await prisma.pageContent.findFirst();
  } catch (e) {
    // default
  }

  const text = content?.privacyText || `CT Corp Commitment to Data Privacy\n\nProtecting the security and privacy of your personal data is important to CT Corp. We hope the policy outlined below will help you understand what data CT Corp may collect, how we use and safeguard that data and with whom we may share it.\n\nPersonal data\nThrough our web sites, CT Corp will not collect any personal data about you (e.g. your name, address, telephone number or e-mail address), unless you voluntarily choose to provide us with it (e.g. by registration, survey), respectively, provide your consent, or unless otherwise permitted by applicable laws and regulations for the protection of your personal data.\n\nPurpose of Use\nWhen you do provide us with personal data, we usually use it to respond to your inquiry, process your order or provide you access to specific information or offers. Also, to support our customer relationship with you: we may store and process personal data and share it with our worldwide affiliates to better understand your business needs and how we can improve our products and services.`;

  return (
    <main>
      <section className="section-primary" style={{ padding: '150px 0 80px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Kebijakan Privasi</h1>
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
