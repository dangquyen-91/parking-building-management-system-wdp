import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLink, MenuIcon, OverlayBackdrop, ThemeToggle } from '../common'
import { useOverlayPanel } from '../../hooks/useOverlayPanel'
import { authApi, getStoredAuthUser, type AuthUser } from '../../services/authApi'

const NAV_LINKS = [
  { href: '#about', label: 'About Us' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#resources', label: 'Resources' },
  { href: '#blog', label: 'Blog' },
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser>()
  const [logoutStatus, setLogoutStatus] = useState<'idle' | 'loading'>('idle')
  const mobileNavRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { close: closeMenu } = useOverlayPanel({
    isOpen: menuOpen,
    panelRef: mobileNavRef,
    triggerRef: menuButtonRef,
    onClose: () => setMenuOpen(false),
  })

  useEffect(() => {
    setAuthUser(getStoredAuthUser())

    const handleStorage = () => {
      setAuthUser(getStoredAuthUser())
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  async function handleLogout() {
    setLogoutStatus('loading')

    try {
      await authApi.logout()
    } catch {
      // Local auth is cleared in authApi.logout even if the API request fails.
    } finally {
      setAuthUser(undefined)
      closeMenu()
      setLogoutStatus('idle')
    }
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-12 lg:px-16">
      <div className="liquid-glass rounded-full flex items-center justify-between gap-3 h-14 px-4 md:px-6 max-w-7xl mx-auto">
        <BrandLink className="flex items-center gap-2 text-fg font-medium text-sm shrink-0 hover:text-fg" />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-muted hover:text-fg transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-ghost"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {authUser ? (
            <>
              <span className="hidden max-w-40 truncate text-xs font-medium text-fg sm:inline-flex">
                {authUser.fullName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutStatus === 'loading'}
                className="hidden text-xs text-muted transition-colors duration-200 hover:text-fg disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
              >
                {logoutStatus === 'loading' ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs text-muted hover:text-fg transition-colors duration-200 px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden md:inline-flex text-xs text-muted hover:text-fg transition-colors duration-200 px-3 py-1.5"
              >
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
          <Link
            to="/booking"
            className="inline-flex items-center text-xs font-medium bg-btn-primary text-btn-primary-fg hover:opacity-90 transition-opacity duration-200 rounded-full px-4 py-2"
          >
            Book Slot
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="lg:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-fg rounded-full hover:bg-ghost"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <OverlayBackdrop onClose={closeMenu} label="Close navigation menu" />
          <nav
            ref={mobileNavRef}
            id="mobile-nav"
            className="liquid-glass rounded-2xl mt-2 p-4 flex flex-col gap-1 max-w-7xl mx-auto lg:hidden relative z-50 overscroll-contain max-h-[min(70vh,24rem)] overflow-y-auto"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-muted hover:text-fg py-2 px-2 rounded-lg hover:bg-ghost transition-colors"
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
            {authUser ? (
              <>
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-semibold text-fg">{authUser.fullName}</p>
                  <p className="mt-0.5 truncate text-xs text-subtle">{authUser.email}</p>
                </div>
                <button
                  type="button"
                  className="text-left text-sm text-muted hover:text-fg py-2 px-2 rounded-lg hover:bg-ghost transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleLogout}
                  disabled={logoutStatus === 'loading'}
                >
                  {logoutStatus === 'loading' ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-muted hover:text-fg py-2 px-2 rounded-lg hover:bg-ghost transition-colors"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-muted hover:text-fg py-2 px-2 rounded-lg hover:bg-ghost transition-colors"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
            <Link
              to="/booking"
              className="text-sm text-muted hover:text-fg py-2 px-2 rounded-lg hover:bg-ghost transition-colors"
              onClick={closeMenu}
            >
              Book Slot
            </Link>
          </nav>
        </>
      )}
    </header>
  )
}
