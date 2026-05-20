export type TopDownSedanTone = 'white' | 'gray'

function TopDownSedan({
  searching,
  tone = 'white',
}: {
  searching?: boolean
  tone?: TopDownSedanTone
}) {
  const stroke = '#1a1a1a'
  const bodyFill = searching ? '#f8fffb' : tone === 'gray' ? '#c5ced6' : '#ffffff'
  const roofFill = searching ? '#f8fffb' : tone === 'gray' ? '#d1dae3' : '#ffffff'

  return (
    <g>
      {searching && (
        <rect
          x="2"
          y="2"
          width="60"
          height="124"
          rx="6"
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.2"
          opacity="0.7"
          strokeDasharray="4 3"
        />
      )}

      {/* Body shell */}
      <path
        d="M32 4
           L46 6 Q52 7 54 12
           L56 22
           L57 38
           L57 90
           L56 106
           Q54 122 46 124
           L18 124
           Q10 122 8 106
           L7 90
           L7 38
           L8 22
           Q10 7 18 6
           Z"
        fill={bodyFill}
        stroke={searching ? '#22c55e' : stroke}
        strokeWidth={searching ? 1.2 : 1}
        strokeLinejoin="round"
      />

      {/* Hood seam */}
      <line x1="14" y1="22" x2="50" y2="22" stroke={stroke} strokeWidth="0.75" opacity="0.85" />

      {/* Front windshield */}
      <path
        d="M17 9 L47 9 L45 21 L19 21 Z"
        fill="#3d4f5f"
        stroke={stroke}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />

      {/* Side windows */}
      <rect x="10" y="28" width="5" height="44" rx="1" fill="#3d4f5f" stroke={stroke} strokeWidth="0.4" />
      <rect x="49" y="28" width="5" height="44" rx="1" fill="#3d4f5f" stroke={stroke} strokeWidth="0.4" />

      {/* Roof panel */}
      <rect x="17" y="24" width="30" height="50" fill={roofFill} />
      <line x1="17" y1="24" x2="47" y2="24" stroke={stroke} strokeWidth="0.4" opacity="0.5" />

      {/* Cabin / trunk seam */}
      <line x1="14" y1="74" x2="50" y2="74" stroke={stroke} strokeWidth="0.75" opacity="0.85" />

      {/* Rear window */}
      <path
        d="M18 78 L46 78 L44 92 L20 92 Z"
        fill="#3d4f5f"
        stroke={stroke}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />

      {/* Trunk lid line */}
      <line x1="16" y1="102" x2="48" y2="102" stroke={stroke} strokeWidth="0.5" opacity="0.6" />

      {/* Rear bumper lip */}
      <path
        d="M20 118 L44 118 Q46 120 44 122 L20 122 Q18 120 20 118 Z"
        fill="#f1f5f9"
        stroke={stroke}
        strokeWidth="0.45"
      />
    </g>
  )
}

/** Inline top-down sedan for parking slots (rotate 90° in CSS for horizontal bays). */
export function TopDownSedanCar({
  className,
  tone = 'white',
  searching,
}: {
  className?: string
  tone?: TopDownSedanTone
  searching?: boolean
}) {
  return (
    <svg className={className} viewBox="0 0 64 128" fill="none" aria-hidden="true">
      <TopDownSedan tone={tone} searching={searching} />
    </svg>
  )
}

export function DetailedCarSymbols() {
  return (
    <>
      {/* id kept for HeroParkingBg — white sedan */}
      <symbol id="car-gray" viewBox="0 0 64 128">
        <TopDownSedan tone="white" />
      </symbol>

      <symbol id="car-green" viewBox="0 0 64 128">
        <TopDownSedan searching />
      </symbol>
    </>
  )
}
