import './globals.css'
import Navbar from '@/components/Navbar'
import { getPageContent } from '@/lib/db'

export const metadata = {
  title: 'CT Corp - Untuk Indonesia yang lebih baik',
  description: 'CT Corp is Indonesia\'s leading consumer-centric diversified group & ecosystem.',
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
            <img src={logoSrc} alt="CT CORP" className="logo" style={{ objectFit: 'contain', width: '120px', height: '40px' }} />
            <p>HAK CIPTA © 2026 CT CORP. SELURUH HAK DILINDUNGI.</p>
          </div>
          <div className="footer-links">
            <a href="/privacy-policy">Kebijakan Privasi</a>
            <a href="/terms-and-conditions">Syarat & Ketentuan</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
