import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Supabase database...')

  // 1. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@ctcorp.id' },
    update: { password: passwordHash, name: 'Super Admin' },
    create: {
      email: 'admin@ctcorp.id',
      password: passwordHash,
      name: 'Super Admin',
      role: 'admin',
    },
  })
  console.log('Admin user seeded (admin@ctcorp.id / admin123)')

  // 2. Page Content
  await prisma.pageContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      homeTitle: 'Untuk Indonesia\nyang lebih baik',
      homeDesc: 'Our Businesses',
      homeSubDesc: "CT Corp is Indonesia's leading consumer-centric diversified group & ecosystem employing more than 100,000 people regionally.",
      homeHeroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
      whoWeAreText: 'CT Corp didirikan oleh Prof. Dr. (H.C.) Chairul Tanjung, bermula dari sebuah bisnis skala kecil yang kini telah bertransformasi menjadi salah satu konglomerasi bisnis terbesar dan paling terintegrasi di Indonesia.',
      whoWeAreImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
      privacyText: 'Melindungi keamanan dan privasi data pribadi Anda adalah komitmen utama CT Corp.',
      termsText: 'Situs web ini disediakan oleh CT Corp dan hanya dapat digunakan untuk tujuan informasi resmi.',
      businessText: 'Ekosistem bisnis terintegrasi yang melayani berbagai kebutuhan masyarakat Indonesia.',
      investorText: 'Informasi keterbukaan, laporan keuangan, dan hubungan investor CT Corp.',
    },
  })
  console.log('Page content seeded')

  // 3. Business Categories & Items
  await prisma.businessItem.deleteMany().catch(() => {})
  await prisma.businessCategory.deleteMany().catch(() => {})

  const categoriesData = [
    {
      title: 'Financial Services',
      order: 1,
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop',
      items: [
        { title: 'Allo Bank', linkUrl: 'https://www.allobank.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Allo+Bank&font=montserrat', order: 1 },
        { title: 'Bank Mega', linkUrl: 'https://www.bankmega.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Bank+Mega&font=montserrat', order: 2 },
        { title: 'Bank Mega Syariah', linkUrl: 'https://www.megasyariah.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Mega+Syariah&font=montserrat', order: 3 },
        { title: 'Mega Insurance', linkUrl: 'https://www.megainsurance.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Mega+Insurance&font=montserrat', order: 4 },
        { title: 'Mega Finance', linkUrl: 'https://www.megafinance.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Mega+Finance&font=montserrat', order: 5 },
        { title: 'PFI Mega Life', linkUrl: 'https://www.pfimegalife.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=PFI+Mega+Life&font=montserrat', order: 6 },
      ],
    },
    {
      title: 'Media',
      order: 2,
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&auto=format&fit=crop',
      items: [
        { title: 'Trans TV', linkUrl: 'https://www.transtv.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+TV&font=montserrat', order: 1 },
        { title: 'Trans7', linkUrl: 'https://www.trans7.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans7&font=montserrat', order: 2 },
        { title: 'Detik Network', linkUrl: 'https://www.detik.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Detikcom&font=montserrat', order: 3 },
        { title: 'CNN Indonesia', linkUrl: 'https://www.cnnindonesia.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=CNN+Indonesia&font=montserrat', order: 4 },
        { title: 'CNBC Indonesia', linkUrl: 'https://www.cnbcindonesia.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=CNBC+Indonesia&font=montserrat', order: 5 },
      ],
    },
    {
      title: 'Leisure & Hospitality',
      order: 3,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
      items: [
        { title: 'The Trans Luxury Hotel', linkUrl: 'https://www.thetranshotel.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Luxury+Hotel&font=montserrat', order: 1 },
        { title: 'The Trans Resort Bali', linkUrl: 'https://www.transresortbali.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Resort+Bali&font=montserrat', order: 2 },
        { title: 'Trans Studio Hotel', linkUrl: 'https://www.transentertainment.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Studio+Hotel&font=montserrat', order: 3 },
      ],
    },
    {
      title: 'Entertainment & Property',
      order: 4,
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop',
      items: [
        { title: 'Trans Studio Bandung', linkUrl: 'https://www.transentertainment.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Studio+Bdg&font=montserrat', order: 1 },
        { title: 'Trans Studio Bali', linkUrl: 'https://www.transentertainment.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Studio+Bali&font=montserrat', order: 2 },
        { title: 'Trans Snow World', linkUrl: 'https://www.transentertainment.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Trans+Snow+World&font=montserrat', order: 3 },
      ],
    },
    {
      title: 'Retail & Lifestyle',
      order: 5,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
      items: [
        { title: 'Transmart', linkUrl: 'https://transmart.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Transmart&font=montserrat', order: 1 },
        { title: 'Metro Department Store', linkUrl: 'https://www.metroindonesia.com', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Metro+Dept+Store&font=montserrat', order: 2 },
        { title: 'The Coffee Bean', linkUrl: 'https://coffeebean.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Coffee+Bean&font=montserrat', order: 3 },
        { title: "Wendy's", linkUrl: 'https://wendys.co.id', imageUrl: "https://placehold.co/260x80/1a1a2e/ffffff?text=Wendy's&font=montserrat", order: 4 },
        { title: 'Baskin Robbins', linkUrl: 'https://baskinrobbins.co.id', imageUrl: 'https://placehold.co/260x80/1a1a2e/ffffff?text=Baskin+Robbins&font=montserrat', order: 5 },
      ],
    },
  ]

  for (const cat of categoriesData) {
    const createdCat = await prisma.businessCategory.create({
      data: {
        title: cat.title,
        imageUrl: cat.imageUrl || null,
        order: cat.order,
      },
    })
    for (const item of cat.items) {
      await prisma.businessItem.create({
        data: {
          categoryId: createdCat.id,
          title: item.title,
          imageUrl: item.imageUrl,
          linkUrl: item.linkUrl,
          order: item.order,
        },
      })
    }
  }
  console.log('Categories and brand items seeded!')

  // 4. Statistics
  const existingStats = await prisma.stat.count()
  if (existingStats === 0) {
    await prisma.stat.createMany({
      data: [
        { value: '100,000+', label: 'Karyawan Berdedikasi', order: 1 },
        { value: '50M+', label: 'Pengguna Ekosistem', order: 2 },
        { value: '30+', label: 'Tahun Pengabdian', order: 3 },
        { value: '100%', label: 'Karya Anak Bangsa', order: 4 },
      ],
    })
    console.log('Stats seeded')
  }

  // 5. News
  const existingNews = await prisma.news.count()
  if (existingNews === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: 'CT Corp Terus Akselerasi Transformasi Digital di Seluruh Unit Bisnis',
          slug: 'ct-corp-akselerasi-transformasi-digital',
          excerpt: 'Melalui integrasi ekosistem digital, CT Corp hadir mempermudah jutaan masyarakat Indonesia setiap harinya.',
          content: '<p>Integrasi ekosistem perbankan digital bersama Allo Bank dan jaringan media DetikNetwork menjadi pendorong utama percepatan penetrasi layanan CT Corp di era digital.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
          published: true,
          order: 1,
        },
        {
          title: 'Allo Bank Raih Penghargaan Digital Banking Terinovatif 2026',
          slug: 'allo-bank-raih-penghargaan-digital-banking-2026',
          excerpt: 'Inovasi ekosistem terbuka Allo Bank dinobatkan sebagai solusi finansial masa depan masyarakat modern.',
          content: '<p>Allo Bank sukses membangun sinergi tanpa batas dengan Transmart, Coffee Bean, hingga jaringan Trans Studio di seluruh Indonesia.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop',
          published: true,
          order: 2,
        },
      ],
    })
    console.log('News seeded')
  }

  // 6. CSR
  const existingCsr = await prisma.csrProgram.count()
  if (existingCsr === 0) {
    await prisma.csrProgram.createMany({
      data: [
        {
          title: 'CT ARSA Foundation: Memutus Rantai Kemiskinan Melalui Pendidikan Berkualitas',
          slug: 'ct-arsa-foundation-pendidikan-berkualitas',
          category: 'Education',
          excerpt: 'Membangun sekolah unggulan berasrama gratis bagi anak-anak berprestasi dari keluarga prasejahtera.',
          content: '<p>Melalui SMA Unggulan CT ARSA Foundation di Sukoharjo dan Deli Serdang, ratusan generasi muda disiapkan menjadi pemimpin masa depan berdaya saing global.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
          order: 1,
        },
        {
          title: 'Mobil Sehat & Aksi Tanggap Bencana CT Corp',
          slug: 'mobil-sehat-dan-tanggap-bencana',
          category: 'Healthcare & Disaster Relief',
          excerpt: 'Layanan kesehatan keliling dan respon cepat bantuan kemanusiaan saat terjadi bencana alam.',
          content: '<p>Unit Mobil Sehat CT ARSA menjangkau pelosok desa untuk memberikan pelayanan medis dasar dan penyuluhan gizi cuma-cuma.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop',
          order: 2,
        },
      ],
    })
    console.log('CSR seeded')
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
