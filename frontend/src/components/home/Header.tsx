import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '#about', label: 'About Us' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#resources', label: 'Resources' },
  { href: '#blog', label: 'Blog' },
] as const

function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 17V8h4a3 3 0 0 1 0 6H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-12 lg:px-16">
      <div className="liquid-glass rounded-full flex items-center justify-between gap-3 h-14 px-4 md:px-6 max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-medium text-sm shrink-0"
          aria-label="Parking System — home"
        >
          <span className="flex items-center justify-center" aria-hidden="true">
            <LogoIcon />
          </span>
          Parking System
        </Link>

        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-gray-300 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-white/10"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-xs text-gray-300 hover:text-white transition-colors duration-200 px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="hidden md:inline-flex text-xs text-gray-300 hover:text-white transition-colors duration-200 px-3 py-1.5"
          >
            Register
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center text-xs font-medium text-black bg-white hover:bg-gray-100 transition-colors duration-200 rounded-full px-4 py-2"
          >
            Book Demo
          </a>
          <button
            type="button"
            className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white rounded-full hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="liquid-glass rounded-2xl mt-2 p-4 flex flex-col gap-1 max-w-7xl mx-auto lg:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-gray-300 hover:text-white py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            to="/login"
            className="text-sm text-gray-300 hover:text-white py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-300 hover:text-white py-2 px-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>
        </nav>
      )}
    </header>
  )
}
