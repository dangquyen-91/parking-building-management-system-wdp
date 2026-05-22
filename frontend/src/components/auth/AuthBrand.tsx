import { Link } from 'react-router-dom'

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

export function AuthBrand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-white font-medium text-sm tracking-tight hover:text-zinc-200 transition-colors duration-200"
      aria-label="Parking System — home"
    >
      <span className="flex items-center justify-center text-white" aria-hidden="true">
        <LogoIcon />
      </span>
      Parking System
    </Link>
  )
}
