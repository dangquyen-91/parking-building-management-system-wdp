import { Link } from 'react-router-dom'
import { LogoIcon } from './icons'

type BrandLinkProps = {
  className?: string
  iconClassName?: string
}

export function BrandLink({
  className = 'inline-flex items-center gap-2 text-fg font-medium text-sm tracking-tight hover:text-muted transition-colors duration-200',
  iconClassName,
}: BrandLinkProps) {
  return (
    <Link to="/" className={className} aria-label="Parking System — home">
      <span className="flex items-center justify-center shrink-0" aria-hidden="true">
        <LogoIcon className={iconClassName} />
      </span>
      Parking System
    </Link>
  )
}
