import './globals.css'
import Navbar from '@/components/Navbar'
import { getPageContent } from '@/lib/db'

export const metadata = {
  title: 'PT. Iskandar Group Indonesia - Untuk Indonesia yang lebih baik',
  description: 'PT. Iskandar Group Indonesia adalah konglomerasi terdiversifikasi terkemuka yang berpusat pada konsumen di Indonesia.',
}

export default async function RootLayout({ children }) {
  let content = null
  try {
    content = await getPageContent()
  } catch (e) {}

  const logoSrc = content?.siteLogo || '/images/home.jpeg'

  return (
    <html lang="id">
      <body>
        <Navbar logoSrc={logoSrc} />
        {children}
        <footer className="footer">
          <div>
            <img src={logoSrc} alt="PT. Iskandar Group Indonesia" className="logo" style={{ objectFit: 'contain', width: '120px', height: '40px' }} />
            <p>HAK CIPTA © 2026 PT. ISKANDAR GROUP INDONESIA. SELURUH HAK DILINDUNGI.</p>
          </div>
          <div className="footer-links">
            <a href="/privacy-policy">Kebijakan Privasi</a>
            <a href="/terms-and-conditions">Syarat & Ketentuan</a>
            <a href="/admin">Admin</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
