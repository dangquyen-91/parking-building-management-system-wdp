type SkipLinkProps = {
  href?: string
  children?: string
}

export function SkipLink({
  href = '#main',
  children = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a href={href} className="skip-link">
      {children}
    </a>
  )
}
