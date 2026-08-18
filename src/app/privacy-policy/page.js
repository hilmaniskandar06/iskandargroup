import { getPageContent } from '@/lib/db'

export default async function PrivacyPolicy() {
  let content = null;
  try {
    content = await getPageContent();
  } catch (e) {
    // default
  }

  const text = content?.privacyText || `Komitmen PT. Iskandar Group Indonesia terhadap Privasi Data\n\nMelindungi keamanan dan privasi data pribadi Anda adalah hal penting bagi PT. Iskandar Group Indonesia. Kami berharap kebijakan berikut membantu Anda memahami data apa yang mungkin dikumpulkan PT. Iskandar Group Indonesia, bagaimana kami menggunakan dan melindungi data tersebut, serta dengan siapa kami dapat membagikannya.\n\nData pribadi\nMelalui situs web kami, PT. Iskandar Group Indonesia tidak akan mengumpulkan data pribadi apa pun tentang Anda (mis. nama, alamat, nomor telepon, atau alamat email), kecuali Anda secara sukarela memilih untuk memberikannya (mis. melalui pendaftaran, survei), memberikan persetujuan Anda, atau kecuali diizinkan oleh undang-undang dan peraturan yang berlaku untuk perlindungan data pribadi Anda.\n\nTujuan Penggunaan\nSaat Anda memberikan data pribadi kepada kami, kami biasanya menggunakannya untuk menanggapi pertanyaan Anda, memproses pesanan Anda, atau memberi Anda akses ke informasi atau penawaran tertentu. Selain itu, untuk mendukung hubungan kami dengan Anda: kami dapat menyimpan dan memproses data pribadi serta membagikannya dengan afiliasi kami di seluruh dunia untuk lebih memahami kebutuhan bisnis Anda dan bagaimana kami dapat meningkatkan produk dan layanan kami.`;

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
