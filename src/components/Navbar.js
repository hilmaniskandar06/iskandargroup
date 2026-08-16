'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/who-we-are', label: 'Tentang Kami' },
  { href: '/business', label: 'Bisnis' },
  { href: '/investor', label: 'Investor' },
  { href: '/news', label: 'Berita' },
  { href: '/csr', label: 'CSR' },
  { href: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="nav-logo-wrap">
          <img
            src="/images/home.jpeg"
            alt="CT CORP"
            className="logo"
            style={{ objectFit: 'none', objectPosition: '10% 5%', width: '150px', height: '60px' }}
          />
        </Link>

        <ul className="nav-links nav-links-desktop">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>

        <button
          aria-label="Menu"
          className="hamburger"
          onClick={() => setOpen(o => !o)}
        >
          <span className={open ? 'bar bar1 open' : 'bar bar1'}></span>
          <span className={open ? 'bar bar2 open' : 'bar bar2'}></span>
          <span className={open ? 'bar bar3 open' : 'bar bar3'}></span>
        </button>
      </nav>

      <div className="navbar-spacer"></div>

      <div
        className={open ? 'drawer-overlay open' : 'drawer-overlay'}
        onClick={() => setOpen(false)}
      ></div>

      <aside className={open ? 'drawer open' : 'drawer'}>
        <div style={{ padding: '20px 20px 10px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            src="/images/home.jpeg"
            alt="CT CORP"
            style={{ objectFit: 'none', objectPosition: '10% 5%', width: '130px', height: '50px' }}
          />
          <button aria-label="Close" onClick={() => setOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '28px', lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
        <ul className="drawer-links">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
