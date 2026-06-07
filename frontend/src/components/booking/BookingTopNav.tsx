import { Link } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle } from '../common'

export function BookingTopNav() {
  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-theme bg-page/95 px-4 backdrop-blur-md md:px-8 lg:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <BrandLink className="flex items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <nav className="flex items-center gap-2" aria-label="User navigation">
            <Link
              to="/"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/my-bookings"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              My bookings
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  )
}
