import { useState } from 'react'
import { LogoIcon, MenuIcon } from './icons'

const NAV_LINKS = [
  { href: '#about', label: 'About Us' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#resources', label: 'Resources' },
  { href: '#blog', label: 'Blog' },
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="home-header">
      <div className="landing__container home-header__inner">
        <a href="/" className="home-header__logo" aria-label="Parking — building parking management">
          <span className="home-header__logo-icon" aria-hidden="true">
            <LogoIcon />
          </span>
          Parking
        </a>

        <nav
          className={`home-header__nav${menuOpen ? ' home-header__nav--open' : ''}`}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="home-header__actions">
          <button
            type="button"
            className="home-header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon />
          </button>
          <a href="#login" className="btn btn--ghost" aria-label="Log in to your account">
            Login
          </a>
          <a href="#demo" className="btn btn--primary" aria-label="Book a demo for your building">
            Book Demo
          </a>
        </div>
      </div>
    </header>
  )
}
