import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'CT Corp - Untuk Indonesia yang lebih baik',
  description: 'CT Corp is Indonesia\'s leading consumer-centric diversified group & ecosystem.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        {children}
        <footer className="footer">
          <div>
            <img src="/images/home.jpeg" alt="CT CORP" className="logo" style={{ objectFit: 'none', objectPosition: '10% 5%', width: '120px', height: '40px' }} />
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
