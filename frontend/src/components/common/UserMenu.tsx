import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '../../services/authApi'

type UserMenuProps = {
  user: AuthUser
  logoutStatus: 'idle' | 'loading'
  onLogout: () => void
  activeItem?: 'profile'
  buttonClassName?: string
}

export function UserMenu({
  user,
  logoutStatus,
  onLogout,
  activeItem,
  buttonClassName = 'rounded-full',
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        className={[
          'flex min-w-0 items-center gap-2 border border-transparent px-3 py-1.5 text-left transition-colors hover:border-sky-500/30 hover:bg-sky-500/10',
          buttonClassName,
          isOpen ? 'border-sky-500/40 bg-sky-500/10 text-fg' : 'text-fg',
        ].join(' ')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0">
          <span className="block max-w-40 truncate text-xs font-semibold text-fg">{user.fullName}</span>
          <span className="block max-w-40 truncate text-[10px] text-subtle">{user.email}</span>
        </span>
        <span className={['text-[10px] transition-transform text-sky-500', isOpen ? 'rotate-180' : ''].join(' ')} aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-sky-500/20 bg-page shadow-xl shadow-sky-950/15"
          role="menu"
        >
          {user.role === 'user' && (
            <>
              <Link
                to="/my-bookings"
                className="block px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Đặt chỗ của tôi
              </Link>
              <Link
                to="/my-subscriptions"
                className="block border-t border-theme px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Gói của tôi
              </Link>
              <Link
                to="/my-subscriptions#wrong-slot-report"
                className="block border-t border-theme px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-200"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Báo xe đậu sai chỗ
              </Link>
              <Link
                to="/profile"
                className={[
                  'block border-t border-theme px-4 py-3 text-sm font-medium transition-colors hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-100',
                  activeItem === 'profile' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-100' : 'text-muted',
                ].join(' ')}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Hồ sơ
              </Link>
            </>
          )}
          <button
            type="button"
            className="block w-full border-t border-theme px-4 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-rose-100"
            role="menuitem"
            disabled={logoutStatus === 'loading'}
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
          >
            {logoutStatus === 'loading' ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      )}
    </div>
  )
}
