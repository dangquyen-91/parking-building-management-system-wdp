import { DetailedCarSymbols } from './DetailedCarSymbols'

export function HeroParkingBg() {  return (
    <div
      className="home-hero__bg"
      role="img"
      aria-label="Illustration of basement parking levels in a building with cars searching for available slots"
    >
      <svg
        className="home-hero__bg-svg"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#1a2332" strokeWidth="0.7" />
          </pattern>
          <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.25" />
          </linearGradient>
          <filter id="carGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <DetailedCarSymbols />
        </defs>

        <rect width="1200" height="500" fill="#0a0f14" />
        <rect width="1200" height="500" fill="url(#heroGrid)" opacity="0.85" />

        {/* Building tower hint */}
        <g fill="#141b24" stroke="#243044" strokeWidth="1.2" opacity="0.9">
          <rect x="1080" y="24" width="90" height="452" rx="8" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <rect
              key={i}
              x="1092"
              y={40 + i * 48}
              width="66"
              height="32"
              rx="3"
              fill="#0f1620"
              stroke="#1e2d3d"
            />
          ))}
          <text
            x="1125"
            y="18"
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          >
            TOWER
          </text>
        </g>

        {/* Basement level zones */}
        <g stroke="#243044" strokeWidth="1.2" fill="#111820" opacity="0.95">
          <rect x="40" y="40" width="480" height="200" rx="10" />
          <rect x="560" y="40" width="500" height="140" rx="10" />
          <rect x="560" y="220" width="500" height="240" rx="10" />
          <rect x="40" y="280" width="480" height="180" rx="10" />
        </g>

        <g fill="#4ade80" fontSize="13" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" opacity="0.9">
          <text x="56" y="62">B1</text>
          <text x="576" y="62">B2</text>
          <text x="576" y="242">B3</text>
          <text x="56" y="302">B4</text>
        </g>

        {/* Parking slots */}
        {slotGrid(40, 52, 8, 4, 52, 38)}
        {slotGrid(572, 52, 8, 3, 52, 34)}
        {slotGrid(572, 232, 8, 5, 52, 38)}
        {slotGrid(52, 292, 8, 4, 52, 38)}

        {/* Available slots — green dashed */}
        <g fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.85">
          <rect x="304" y="92" width="44" height="30" rx="5" />
          <rect x="360" y="92" width="44" height="30" rx="5" />
          <rect x="728" y="92" width="44" height="30" rx="5" />
          <rect x="884" y="270" width="44" height="30" rx="5" />
          <rect x="156" y="330" width="44" height="30" rx="5" />
        </g>

        <g fill="#4ade80" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          <text x="326" y="112" textAnchor="middle">
            P
          </text>
          <text x="382" y="112" textAnchor="middle">
            P
          </text>
          <text x="750" y="112" textAnchor="middle">
            P
          </text>
          <text x="906" y="290" textAnchor="middle">
            P
          </text>
          <text x="178" y="350" textAnchor="middle">
            P
          </text>
        </g>

        {/* Parked — top-down white sedans inside slots */}
        <ParkedCar ox={40} oy={52} col={1} row={0} cw={52} ch={38} />
        <ParkedCar ox={40} oy={52} col={2} row={0} cw={52} ch={38} />
        <ParkedCar ox={572} oy={52} col={1} row={0} cw={52} ch={34} />
        <ParkedCar ox={572} oy={52} col={2} row={0} cw={52} ch={34} />
        <ParkedCar ox={572} oy={232} col={1} row={1} cw={52} ch={38} />
        <ParkedCar ox={52} oy={292} col={1} row={1} cw={52} ch={38} />

        {/* GPS routes to open spots */}
        <path
          className="home-hero__route"
          d="M80 420 C200 360 260 280 326 107"
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 7"
          filter="url(#carGlow)"
        />
        <path
          className="home-hero__route home-hero__route--delay"
          d="M1050 400 C920 320 820 200 750 107"
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 7"
        />
        <path
          d="M420 430 Q520 350 580 285 T750 107"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
          strokeDasharray="6 8"
        />

        {/* Searching pulse rings */}
        <g className="home-hero__pulse" transform="translate(80, 420)">
          <circle r="22" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.55" />
          <circle r="34" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.3" />
        </g>
        <g className="home-hero__pulse home-hero__pulse--delay" transform="translate(1050, 400)">
          <circle r="22" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.55" />
          <circle r="34" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
        </g>
        <g className="home-hero__pulse home-hero__pulse--delay2" transform="translate(420, 430)">
          <circle r="16" fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.45" />
        </g>

        {/* Cars actively searching — top-down, following routes */}
        <MovingCar cx={82} cy={410} angle={-18} searching showPulse />
        <MovingCar cx={1050} cy={390} angle={14} searching showPulse />
        <MovingCar cx={419} cy={419} angle={-6} searching />
        <MovingCar cx={318} cy={207} angle={12} />
        <MovingCar cx={917} cy={185} angle={-10} />
        <MovingCar cx={538} cy={79} angle={-4} searching />

        <circle cx="326" cy="107" r="7" fill="#4ade80" filter="url(#carGlow)" />
        <circle cx="750" cy="107" r="6" fill="#22c55e" filter="url(#carGlow)" />
        <circle cx="906" cy="285" r="6" fill="#22c55e" opacity="0.9" />
      </svg>
    </div>
  )
}

/* Aspect matches sedan sprite viewBox 64×128 */
const CAR_W = 28
const CAR_H = 56

function slotCenter(ox: number, oy: number, col: number, row: number, cw: number, ch: number) {
  const x = ox + 16 + col * (cw + 8) + cw / 2
  const y = oy + 16 + row * (ch + 10) + ch / 2
  return { x, y }
}

function ParkedCar({
  ox,
  oy,
  col,
  row,
  cw,
  ch,
}: {
  ox: number
  oy: number
  col: number
  row: number
  cw: number
  ch: number
}) {
  const { x: cx, y: cy } = slotCenter(ox, oy, col, row, cw, ch)
  return (
    <use
      href="#car-gray"
      x={cx - CAR_W / 2}
      y={cy - CAR_H / 2}
      width={CAR_W}
      height={CAR_H}
      transform={`rotate(90 ${cx} ${cy})`}
      opacity={0.95}
    />
  )
}

function MovingCar({
  cx,
  cy,
  angle,
  searching = false,
  showPulse = false,
}: {
  cx: number
  cy: number
  angle: number
  searching?: boolean
  showPulse?: boolean
}) {
  const href = searching ? '#car-green' : '#car-gray'
  return (
    <g className={searching ? 'home-hero__car' : undefined}>
      {showPulse && (
        <rect
          x={cx - 18}
          y={cy - 28}
          width={36}
          height={56}
          rx={4}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.5"
          opacity="0.4"
        />
      )}
      <use
        href={href}
        x={cx - CAR_W / 2}
        y={cy - CAR_H / 2}
        width={CAR_W}
        height={CAR_H}
        transform={`rotate(${angle} ${cx} ${cy})`}
        filter={searching ? 'url(#carGlow)' : undefined}
        opacity={searching ? 1 : 0.88}
      />
      {showPulse && (
        <text x={cx} y={cy - 28} textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="800">
          ?
        </text>
      )}
    </g>
  )
}

function slotGrid(
  ox: number,
  oy: number,
  cols: number,
  rows: number,
  cw: number,
  ch: number,
) {
  const slots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push(
        <rect
          key={`${ox}-${oy}-${r}-${c}`}
          x={ox + 16 + c * (cw + 8)}
          y={oy + 16 + r * (ch + 10)}
          width={cw}
          height={ch}
          rx="5"
          fill="#0f1620"
          stroke="#1e2d3d"
          strokeWidth="1"
          opacity="0.9"
        />,
      )
    }
  }
  return <g>{slots}</g>
}
