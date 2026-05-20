type IconProps = {
  className?: string
  'aria-hidden'?: boolean
}

export function LogoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 17h14v2H5v-2zm2-8h2v6H7V9zm4 0h2v6h-2V9zm4 0h2v6h-2V9zM4 7l2-4h12l2 4v2H4V7z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function HeroMapBg() {
  return (
    <svg
      className="home-hero__bg"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="pathGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <path
        d="M80 380 Q200 200 350 280 T550 180 T750 320 T1050 120"
        fill="none"
        stroke="url(#pathGlow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="350" cy="280" r="6" fill="#22c55e" opacity="0.9" />
      <circle cx="750" cy="320" r="6" fill="#4ade80" opacity="0.7" />
      <g fill="#334155" opacity="0.6">
        <rect x="180" y="120" width="24" height="14" rx="3" transform="rotate(-15 192 127)" />
        <rect x="620" y="90" width="24" height="14" rx="3" transform="rotate(10 632 97)" />
        <rect x="880" y="200" width="24" height="14" rx="3" />
      </g>
    </svg>
  )
}

export function MapSectionVisual() {
  return (
    <svg
      className="home-search__map"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Basement floor plan showing parking slots across levels B1, B2, and B3"
    >
      <rect width="100%" height="100%" fill="#0c1117" />

      {/* B1 */}
      <g>
        <rect x="24" y="24" width="1152" height="100" rx="10" fill="#111820" stroke="#243044" />
        <text x="44" y="48" fill="#4ade80" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">
          B1 — Tenants
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
          <rect
            key={`b1-${i}`}
            x={120 + i * 66}
            y="58"
            width="52"
            height="52"
            rx="6"
            fill={i === 8 || i === 12 ? '#14532d' : '#0f1620'}
            stroke={i === 8 || i === 12 ? '#22c55e' : '#1e2d3d'}
            strokeWidth={i === 8 || i === 12 ? 2 : 1}
          />
        ))}
        <text x="648" y="92" textAnchor="middle" fill="#4ade80" fontSize="11" fontFamily="Inter, sans-serif">
          A-09 Available
        </text>
      </g>

      {/* B2 */}
      <g>
        <rect x="24" y="140" width="1152" height="100" rx="10" fill="#111820" stroke="#243044" />
        <text x="44" y="164" fill="#4ade80" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">
          B2 — Visitors
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
          <rect
            key={`b2-${i}`}
            x={120 + i * 66}
            y="174"
            width="52"
            height="52"
            rx="6"
            fill={i === 3 ? '#14532d' : '#0f1620'}
            stroke={i === 3 ? '#22c55e' : '#1e2d3d'}
            strokeWidth={i === 3 ? 2 : 1}
          />
        ))}
        <text x="318" y="208" textAnchor="middle" fill="#4ade80" fontSize="11" fontFamily="Inter, sans-serif">
          V-04 Available
        </text>
      </g>

      {/* B3 */}
      <g>
        <rect x="24" y="256" width="1152" height="120" rx="10" fill="#111820" stroke="#243044" />
        <text x="44" y="280" fill="#4ade80" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">
          B3 — EV / VIP
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
          <rect
            key={`b3-${i}`}
            x={120 + i * 66}
            y="292"
            width="52"
            height="52"
            rx="6"
            fill={i === 14 ? '#14532d' : '#0f1620'}
            stroke={i === 14 ? '#22c55e' : '#1e2d3d'}
            strokeWidth={i === 14 ? 2 : 1}
          />
        ))}
        <text x="1044" y="326" textAnchor="middle" fill="#4ade80" fontSize="11" fontFamily="Inter, sans-serif">
          E-15 Available
        </text>
      </g>
    </svg>
  )
}
export function SocialIcon({ type }: { type: 'facebook' | 'twitter' | 'linkedin' | 'instagram' }) {
  const paths: Record<string, string> = {
    facebook:
      'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    linkedin:
      'M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.978v16h4.978v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.66-8.849-7.393-11.016-3.614v-2.256z',
    instagram:
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  )
}
