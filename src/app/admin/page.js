import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  updatePageContent, logoutAction,
  upsertBusinessCategory, deleteBusinessCategory,
  upsertBusinessItem, deleteBusinessItem,
  upsertStat, deleteStat,
  upsertNews, deleteNews,
  upsertCSR, deleteCSR,
  upsertInvestor, deleteInvestor,
} from './actions'

const TABS = [
  { id: 'pages', label: 'Konten Halaman' },
  { id: 'business', label: 'Kategori & Brand Bisnis' },
  { id: 'stats', label: 'Statistik' },
  { id: 'news', label: 'Berita' },
  { id: 'csr', label: 'CSR' },
  { id: 'investor', label: 'Hubungan Investor' },
]

const defaults = {
  homeTitle: 'Untuk Indonesia\nyang lebih baik',
  homeDesc: 'Our Businesses',
  homeSubDesc: 'CT Corp is Indonesia\'s leading consumer-centric diversified group & ecosystem employing more than 100,000 people regionally.',
  homeHeroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  whoWeAreText: 'Our Founder Prof. Dr. Chairul Tanjung grew CT Corp to be a massive business ecosystem.',
  whoWeAreImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
  privacyText: 'Protecting the security and privacy of your personal data is important to CT Corp.',
  termsText: 'This web site is provided by CT Corp and may be used for informational purposes only.',
  businessText: 'Our diversified business verticals.',
  investorText: 'Investor relations information.',
}

export default async function AdminPage(props) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const searchParams = await props.searchParams
  const activeTab = TABS.find(t => t.id === searchParams?.tab)?.id || 'pages'
  const editBizId = searchParams?.editBiz ? Number(searchParams.editBiz) : null
  const editItemId = searchParams?.editItem ? Number(searchParams.editItem) : null
  const editStatId = searchParams?.editStat ? Number(searchParams.editStat) : null
  const editNewsId = searchParams?.editNews ? Number(searchParams.editNews) : null
  const editCsrId = searchParams?.editCsr ? Number(searchParams.editCsr) : null
  const editInvId = searchParams?.editInv ? Number(searchParams.editInv) : null

  const [content, businesses, stats, news, csr, investors] = await Promise.all([
    prisma.pageContent.findFirst().catch(() => null),
    prisma.businessCategory.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    }).catch(() =>
      // fallback for stale Prisma client that doesn't know about 'items' relation yet
      prisma.businessCategory.findMany({ orderBy: { order: 'asc' } }).catch(() => [])
    ),
    prisma.stat.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
    prisma.news.findMany({ orderBy: [{ order: 'asc' }, { date: 'desc' }] }).catch(() => []),
    prisma.csrProgram.findMany({ orderBy: [{ order: 'asc' }, { date: 'desc' }] }).catch(() => []),
    prisma.investorContent.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }).catch(() => []),
  ])

  const page = { ...defaults, ...(content || {}) }
  const editBiz = editBizId ? businesses.find(b => b.id === editBizId) : null
  const allItems = businesses.flatMap(b => b.items || [])
  const editItem = editItemId ? allItems.find(i => i.id === editItemId) : null
  const editStat = editStatId ? stats.find(s => s.id === editStatId) : null
  const editNews = editNewsId ? news.find(n => n.id === editNewsId) : null
  const editCsr = editCsrId ? csr.find(c => c.id === editCsrId) : null
  const editInv = editInvId ? investors.find(i => i.id === editInvId) : null

  return (
    <main style={{ padding: '110px 0 60px 0', background: '#f4f4f6', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '4px' }}>Panel Admin CT CORP</h2>
            <p style={{ color: '#666' }}>Masuk sebagai <strong>{session.email}</strong> ({session.role})</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn" style={{ background: '#991b1b' }}>Keluar (Logout)</button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '6px', borderRadius: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <a key={tab.id} href={`/admin?tab=${tab.id}`}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: activeTab === tab.id ? 'white' : '#444',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                transition: 'all .2s',
              }}>
              {tab.label}
            </a>
          ))}
        </div>

        {activeTab === 'pages' && (
          <div className="admin-container" style={{ maxWidth: '100%', marginTop: 0 }}>
            <h3 style={{ marginBottom: '20px' }}>Teks Halaman &amp; Konten Media</h3>
            <form action={updatePageContent}>
              <h4 style={{ color: '#333', margin: '16px 0 10px 0' }}>Halaman Beranda (Homepage)</h4>
              <div className="form-group"><label className="form-label">Judul Utama Banner Hero</label>
                <textarea className="form-textarea" style={{ minHeight: '80px' }} name="homeTitle" defaultValue={page.homeTitle} /></div>
              
              <div className="form-group">
                <label className="form-label">Unggah Gambar Banner Hero (Supabase Storage)</label>
                <input type="file" className="form-input" name="homeHeroImgFile" accept="image/*" />
              </div>
              <div className="form-group"><label className="form-label">Atau Masukkan URL Gambar Hero</label>
                <input className="form-input" name="homeHeroImg" defaultValue={page.homeHeroImg} /></div>
              
              <div className="form-group"><label className="form-label">Judul Bagian Bisnis (Bisnis Kami)</label>
                <input className="form-input" name="homeDesc" defaultValue={page.homeDesc} /></div>
              <div className="form-group"><label className="form-label">Sub-Deskripsi Bagian Bisnis</label>
                <textarea className="form-textarea" name="homeSubDesc" defaultValue={page.homeSubDesc} /></div>

              <hr style={{ margin: '30px 0' }} />
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Halaman Tentang Kami (Who We Are)</h4>
              <div className="form-group"><label className="form-label">Profil / Deskripsi Perusahaan &amp; Pendiri</label>
                <textarea className="form-textarea" style={{ minHeight: '200px' }} name="whoWeAreText" defaultValue={page.whoWeAreText} /></div>
              
              <div className="form-group">
                <label className="form-label">Unggah Foto Pendiri (Supabase Storage)</label>
                <input type="file" className="form-input" name="whoWeAreImgFile" accept="image/*" />
              </div>
              <div className="form-group"><label className="form-label">Atau URL Foto Pendiri</label>
                <input className="form-input" name="whoWeAreImg" defaultValue={page.whoWeAreImg} /></div>

              <hr style={{ margin: '30px 0' }} />
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Halaman Bisnis &amp; Hubungan Investor</h4>
              <div className="form-group"><label className="form-label">Teks Pengantar Halaman Bisnis</label>
                <textarea className="form-textarea" name="businessText" defaultValue={page.businessText} /></div>
              <div className="form-group"><label className="form-label">Teks Pengantar Halaman Investor</label>
                <textarea className="form-textarea" name="investorText" defaultValue={page.investorText} /></div>

              <hr style={{ margin: '30px 0' }} />
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Halaman Legalitas</h4>
              <div className="form-group"><label className="form-label">Kebijakan Privasi (Privacy Policy)</label>
                <textarea className="form-textarea" style={{ minHeight: '250px' }} name="privacyText" defaultValue={page.privacyText} /></div>
              <div className="form-group"><label className="form-label">Syarat &amp; Ketentuan (Terms &amp; Conditions)</label>
                <textarea className="form-textarea" style={{ minHeight: '250px' }} name="termsText" defaultValue={page.termsText} /></div>

              <button type="submit" className="btn">Simpan Perubahan Konten</button>
            </form>
          </div>
        )}

        {activeTab === 'business' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Section 1: Manage Categories ─────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="admin-container" style={{ marginTop: 0 }}>
                <h3 style={{ marginBottom: '16px' }}>{editBiz ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}</h3>
                <form action={upsertBusinessCategory} encType="multipart/form-data">
                  <input type="hidden" name="id" value={editBiz?.id || ''} />
                  <div className="form-group"><label className="form-label">Nama Kategori</label>
                    <input className="form-input" name="title" required defaultValue={editBiz?.title || ''} placeholder="Contoh: Financial Services" /></div>
                  <div className="form-group">
                    <label className="form-label">Foto / Gambar Kategori</label>
                    <input type="file" className="form-input" name="catImageFile" accept="image/*" />
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>*Atau isi URL di bawah ini</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL Foto Kategori</label>
                    <input className="form-input" name="catImageUrl" defaultValue={editBiz?.imageUrl || ''} placeholder="https://..." />
                    {editBiz?.imageUrl && <img src={editBiz.imageUrl} alt="" style={{ marginTop: '8px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />}
                  </div>
                  <div className="form-group"><label className="form-label">Urutan Tampil</label>
                    <input className="form-input" type="number" name="order" defaultValue={editBiz?.order ?? 0} /></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn">{editBiz ? 'Perbarui Kategori' : 'Simpan Kategori'}</button>
                    {editBiz && <a href="/admin?tab=business" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal</a>}
                  </div>
                </form>
              </div>

              <div className="admin-container" style={{ marginTop: 0, maxHeight: '480px', overflow: 'auto' }}>
                <h3 style={{ marginBottom: '12px' }}>Daftar Kategori ({businesses.length})</h3>
                {businesses.length === 0 && <p style={{ color: '#888' }}>Belum ada kategori.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {businesses.map(b => (
                    <div key={b.id} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {b.imageUrl
                        ? <img src={b.imageUrl} alt={b.title} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                        : <div style={{ width: '52px', height: '52px', borderRadius: '6px', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{b.title.charAt(0)}</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>{b.items?.length || 0} brand</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <a href={`/admin?tab=business&editBiz=${b.id}`} className="btn" style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                        <form action={deleteBusinessCategory}>
                          <input type="hidden" name="id" value={b.id} />
                          <button type="submit" className="btn" style={{ background: '#991b1b', padding: '4px 10px', fontSize: '0.78rem' }}>Hapus</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 2: Manage Brand Items ─────────────────────────── */}
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '4px' }}>{editItem ? `✏️ Edit Brand: ${editItem.title}` : '➕ Tambah Brand / Logo ke Kategori'}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '16px' }}>Setiap kategori bisa memiliki banyak brand/logo. Unggah logo perusahaan (background transparan lebih bagus).</p>
              <form action={upsertBusinessItem} encType="multipart/form-data">
                <input type="hidden" name="id" value={editItem?.id || ''} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '14px', alignItems: 'start' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Kategori *</label>
                    <select className="form-input" name="categoryId" required defaultValue={editItem?.categoryId || ''}>
                      <option value="">-- Pilih Kategori --</option>
                      {businesses.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Nama Brand *</label>
                    <input className="form-input" name="title" required defaultValue={editItem?.title || ''} placeholder="Contoh: Bank Mega" /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Urutan</label>
                    <input className="form-input" type="number" name="order" defaultValue={editItem?.order ?? 0} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px', alignItems: 'start' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">📁 Unggah Logo (Supabase Storage)</label>
                    <input type="file" className="form-input" name="imageFile" accept="image/*" />
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>*Prioritas lebih tinggi dari URL di samping</div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">URL Logo / Gambar</label>
                    <input className="form-input" name="imageUrl" defaultValue={editItem?.imageUrl || ''} placeholder="https://..." />
                    {editItem?.imageUrl && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#1a1a2e', borderRadius: '6px', display: 'inline-block' }}>
                        <img src={editItem.imageUrl} alt="" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '14px' }}><label className="form-label">Link Tujuan saat Logo Diklik (opsional)</label>
                  <input className="form-input" name="linkUrl" defaultValue={editItem?.linkUrl || ''} placeholder="Contoh: https://bankmega.com" /></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn">{editItem ? 'Perbarui Brand' : 'Simpan Brand'}</button>
                  {editItem && <a href="/admin?tab=business" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal</a>}
                </div>
              </form>
            </div>

            {/* ── Section 3: Brand List per Category ───────────────────── */}
            {businesses.map(cat => (
              <div key={cat.id} className="admin-container" style={{ marginTop: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  {cat.imageUrl && <img src={cat.imageUrl} alt={cat.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />}
                  <h3 style={{ margin: 0 }}>{cat.title} <span style={{ fontWeight: 400, fontSize: '0.85rem', color: '#888' }}>({cat.items?.length || 0} brand)</span></h3>
                </div>
                {(!cat.items || cat.items.length === 0) && (
                  <p style={{ color: '#aaa', fontSize: '0.85rem', padding: '20px', textAlign: 'center', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
                    Belum ada brand. Tambahkan di form atas.
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                  {cat.items?.map(item => (
                    <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#1a1a2e' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '110px', maxHeight: '60px', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '8px 6px', background: '#fff' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333', textAlign: 'center', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <a href={`/admin?tab=business&editItem=${item.id}`} className="btn" style={{ padding: '3px 8px', fontSize: '0.7rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                          <form action={deleteBusinessItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="btn" style={{ background: '#991b1b', padding: '3px 8px', fontSize: '0.7rem' }}>Hapus</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}


        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '16px' }}>{editStat ? 'Edit Statistik' : 'Tambah / Edit Angka Statistik'}</h3>
              <form action={upsertStat}>
                <input type="hidden" name="id" value={editStat?.id || ''} />
                <div className="form-group"><label className="form-label">Nilai Angka (contoh: 100,000+)</label>
                  <input className="form-input" name="value" required defaultValue={editStat?.value || ''} placeholder="100,000+" /></div>
                <div className="form-group"><label className="form-label">Label Keterangan (contoh: KARYAWAN DI SELURUH NEGERI)</label>
                  <input className="form-input" name="label" required defaultValue={editStat?.label || ''} placeholder="KARYAWAN DI SELURUH NEGERI" /></div>
                <div className="form-group"><label className="form-label">Urutan Tampil (Angka)</label>
                  <input className="form-input" type="number" name="order" defaultValue={editStat?.order ?? 0} /></div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn">{editStat ? 'Perbarui Statistik' : 'Simpan Statistik'}</button>
                  {editStat && <a href="/admin?tab=stats" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal Edit</a>}
                </div>
              </form>
            </div>
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '16px' }}>Daftar Statistik ({stats.length})</h3>
              {stats.length === 0 && <p style={{ color: '#888' }}>Belum ada data statistik.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.map(s => (
                  <div key={s.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{s.label}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`/admin?tab=stats&editStat=${s.id}`} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                      <form action={deleteStat}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" className="btn" style={{ background: '#991b1b', padding: '6px 12px', fontSize: '0.8rem' }}>Hapus</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '16px' }}>{editNews ? 'Edit Artikel Berita' : 'Tambah Berita Baru'}</h3>
              <form action={upsertNews}>
                <input type="hidden" name="id" value={editNews?.id || ''} />
                <div className="form-group"><label className="form-label">Judul Berita</label>
                  <input className="form-input" name="title" required defaultValue={editNews?.title || ''} placeholder="Judul artikel berita..." /></div>
                <div className="form-group"><label className="form-label">Slug URL (Otomatis jika dikosongkan)</label>
                  <input className="form-input" name="slug" defaultValue={editNews?.slug || ''} placeholder="contoh-slug-berita" /></div>
                <div className="form-group">
                  <label className="form-label">Unggah Gambar Sampul (Supabase Storage)</label>
                  <input type="file" className="form-input" name="imageFile" accept="image/*" />
                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '4px'}}>*Atau gunakan tautan URL gambar di bawah</div>
                </div>
                <div className="form-group"><label className="form-label">URL Gambar Sampul</label>
                  <input className="form-input" name="imageUrl" defaultValue={editNews?.imageUrl || ''} placeholder="https://..." /></div>
                <div className="form-group"><label className="form-label">Ringkasan Berita (Excerpt)</label>
                  <textarea className="form-textarea" style={{ minHeight: '80px' }} name="excerpt" defaultValue={editNews?.excerpt || ''} placeholder="Ringkasan singkat berita..." /></div>
                <div className="form-group"><label className="form-label">Konten Lengkap Berita</label>
                  <textarea className="form-textarea" style={{ minHeight: '200px' }} name="content" defaultValue={editNews?.content || ''} placeholder="Tulis isi berita lengkap di sini..." /></div>
                <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><input type="checkbox" name="published" defaultChecked={editNews ? editNews.published : true} /> Publikasikan (Tampilkan di Web)</label>
                  <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>Urutan: <input className="form-input" style={{ width: '90px' }} type="number" name="order" defaultValue={editNews?.order ?? 0} /></label>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn">{editNews ? 'Perbarui Berita' : 'Terbitkan Berita'}</button>
                  {editNews && <a href="/admin?tab=news" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal Edit</a>}
                </div>
              </form>
            </div>
            <div className="admin-container" style={{ marginTop: 0, maxHeight: '700px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Daftar Berita ({news.length})</h3>
              {news.length === 0 && <p style={{ color: '#888' }}>Belum ada artikel berita.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {news.map(n => (
                  <div key={n.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                    {n.imageUrl && <img src={n.imageUrl} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: n.published ? '#047857' : '#b45309' }}>{n.published ? 'Terbit' : 'Draf'} · {new Date(n.date).toLocaleDateString('id-ID')}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <a href={`/news/${n.slug}`} target="_blank" className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#065f46', textDecoration: 'none' }}>Lihat</a>
                        <a href={`/admin?tab=news&editNews=${n.id}`} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                        <form action={deleteNews}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" className="btn" style={{ background: '#991b1b', padding: '6px 12px', fontSize: '0.8rem' }}>Hapus</button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'csr' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '16px' }}>{editCsr ? 'Edit Program CSR' : 'Tambah Program CSR Baru'}</h3>
              <form action={upsertCSR}>
                <input type="hidden" name="id" value={editCsr?.id || ''} />
                <div className="form-group"><label className="form-label">Judul Program CSR</label>
                  <input className="form-input" name="title" required defaultValue={editCsr?.title || ''} placeholder="Judul program..." /></div>
                <div className="form-group"><label className="form-label">Slug URL (Otomatis jika dikosongkan)</label>
                  <input className="form-input" name="slug" defaultValue={editCsr?.slug || ''} placeholder="contoh-slug-csr" /></div>
                <div className="form-group"><label className="form-label">Kategori (Pendidikan, Lingkungan, Kesehatan…)</label>
                  <input className="form-input" name="category" defaultValue={editCsr?.category || ''} placeholder="Pendidikan, Sosial, Kesehatan..." /></div>
                <div className="form-group">
                  <label className="form-label">Unggah Gambar Sampul (Supabase Storage)</label>
                  <input type="file" className="form-input" name="imageFile" accept="image/*" />
                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '4px'}}>*Atau gunakan tautan URL gambar di bawah</div>
                </div>
                <div className="form-group"><label className="form-label">URL Gambar Sampul</label>
                  <input className="form-input" name="imageUrl" defaultValue={editCsr?.imageUrl || ''} placeholder="https://..." /></div>
                <div className="form-group"><label className="form-label">Ringkasan Program (Excerpt)</label>
                  <textarea className="form-textarea" style={{ minHeight: '80px' }} name="excerpt" defaultValue={editCsr?.excerpt || ''} placeholder="Ringkasan singkat program..." /></div>
                <div className="form-group"><label className="form-label">Konten Lengkap Program</label>
                  <textarea className="form-textarea" style={{ minHeight: '200px' }} name="content" defaultValue={editCsr?.content || ''} placeholder="Deskripsi lengkap program CSR..." /></div>
                <div className="form-group"><label className="form-label">Urutan Tampil (Angka)</label>
                  <input className="form-input" type="number" name="order" defaultValue={editCsr?.order ?? 0} /></div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn">{editCsr ? 'Perbarui Program' : 'Simpan Program CSR'}</button>
                  {editCsr && <a href="/admin?tab=csr" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal Edit</a>}
                </div>
              </form>
            </div>
            <div className="admin-container" style={{ marginTop: 0, maxHeight: '700px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Daftar Program CSR ({csr.length})</h3>
              {csr.length === 0 && <p style={{ color: '#888' }}>Belum ada program CSR.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {csr.map(c => (
                  <div key={c.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                    {c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{c.category || '—'} · {new Date(c.date).toLocaleDateString('id-ID')}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <a href={`/csr/${c.slug}`} target="_blank" className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#065f46', textDecoration: 'none' }}>Lihat</a>
                        <a href={`/admin?tab=csr&editCsr=${c.id}`} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                        <form action={deleteCSR}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="btn" style={{ background: '#991b1b', padding: '6px 12px', fontSize: '0.8rem' }}>Hapus</button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="admin-container" style={{ marginTop: 0 }}>
              <h3 style={{ marginBottom: '16px' }}>{editInv ? 'Edit Dokumen Investor' : 'Tambah Dokumen / Laporan Investor'}</h3>
              <form action={upsertInvestor}>
                <input type="hidden" name="id" value={editInv?.id || ''} />
                <div className="form-group"><label className="form-label">Judul Dokumen / Laporan</label>
                  <input className="form-input" name="title" required defaultValue={editInv?.title || ''} placeholder="Contoh: Laporan Tahunan 2025" /></div>
                <div className="form-group"><label className="form-label">Jenis Dokumen</label>
                  <select className="form-input" name="type" defaultValue={editInv?.type || 'report'}>
                    <option value="report">Laporan Tahunan (Annual Report)</option>
                    <option value="quarterly">Laporan Keuangan Kuartalan</option>
                    <option value="presentation">Materi Presentasi Investor</option>
                    <option value="news">Siaran Pers Keuangan</option>
                    <option value="governance">Tata Kelola Perusahaan (Governance)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Tautan URL Berkas (PDF / Dokumen)</label>
                  <input className="form-input" name="fileUrl" defaultValue={editInv?.fileUrl || ''} placeholder="https://..." /></div>
                <div className="form-group"><label className="form-label">Deskripsi / Ringkasan Dokumen</label>
                  <textarea className="form-textarea" style={{ minHeight: '150px' }} name="content" defaultValue={editInv?.content || ''} placeholder="Ringkasan dokumen atau catatan penting..." /></div>
                <div className="form-group" style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ flex: 1 }} className="form-label">Tahun<input className="form-input" type="number" name="year" defaultValue={editInv?.year || ''} placeholder="2025" /></label>
                  <label style={{ flex: 1 }} className="form-label">Kuartal<input className="form-input" type="number" min="1" max="4" name="quarter" defaultValue={editInv?.quarter || ''} placeholder="1-4" /></label>
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><input type="checkbox" name="published" defaultChecked={editInv ? editInv.published : true} /> Publikasikan (Tampilkan di Web)</label>
                  <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>Urutan: <input className="form-input" style={{ width: '90px' }} type="number" name="order" defaultValue={editInv?.order ?? 0} /></label>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn">{editInv ? 'Perbarui Dokumen' : 'Simpan Dokumen Investor'}</button>
                  {editInv && <a href="/admin?tab=investor" className="btn" style={{ background: '#6b7280', textDecoration: 'none' }}>Batal Edit</a>}
                </div>
              </form>
            </div>
            <div className="admin-container" style={{ marginTop: 0, maxHeight: '700px', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Daftar Dokumen Investor ({investors.length})</h3>
              {investors.length === 0 && <p style={{ color: '#888' }}>Belum ada berkas dokumen investor.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {investors.map(i => (
                  <div key={i.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600 }}>{i.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {String(i.type).toUpperCase()} {i.year ? `· ${i.year}` : ''} {i.quarter ? `· Q${i.quarter}` : ''}
                      <span style={{ color: i.published ? '#047857' : '#b45309', marginLeft: '8px' }}>{i.published ? 'Terbit' : 'Draf'}</span>
                    </div>
                    {i.fileUrl && <a href={i.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Buka berkas ↗</a>}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <a href={`/admin?tab=investor&editInv=${i.id}`} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1d4ed8', textDecoration: 'none' }}>Edit</a>
                      <form action={deleteInvestor}>
                        <input type="hidden" name="id" value={i.id} />
                        <button type="submit" className="btn" style={{ background: '#991b1b', padding: '6px 12px', fontSize: '0.8rem' }}>Hapus</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
