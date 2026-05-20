import '../../../styles/home/phone-mockup.css'
import { TopDownSedanCar } from './DetailedCarSymbols'

type PhoneMockupProps = {
  variant?: 'map' | 'booking' | 'cta'
  alt: string
}

export function PhoneMockup({ variant = 'map', alt }: PhoneMockupProps) {
  return (
    <figure className="phone-mockup" aria-label={alt}>
      <div className="phone-mockup__frame">
        <div className="phone-mockup__screen">
          {variant === 'map' && <MapScreen />}
          {variant === 'booking' && <BookingScreen />}
          {variant === 'cta' && <CtaScreen />}
        </div>
      </div>
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  )
}

function PhoneStatusBar() {
  return (
    <div className="phone-app__status" aria-hidden="true">
      <span>9:41</span>
      <div className="phone-app__status-icons">
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
          <rect x="0" y="6" width="2" height="4" rx="0.5" fill="#0f172a" />
          <rect x="3" y="4" width="2" height="6" rx="0.5" fill="#0f172a" />
          <rect x="6" y="2" width="2" height="8" rx="0.5" fill="#0f172a" />
          <rect x="9" y="0" width="2" height="10" rx="0.5" fill="#0f172a" />
        </svg>
        <div className="phone-app__status-bar">
          <div className="phone-app__status-fill" />
        </div>
      </div>
    </div>
  )
}

function PhoneTabBar({ active }: { active: 'map' | 'bookings' | 'profile' }) {
  const tabs = [
    { id: 'map' as const, icon: '⌖', label: 'Slots' },
    { id: 'bookings' as const, icon: '◷', label: 'Bookings' },
    { id: 'profile' as const, icon: '◎', label: 'Profile' },
  ]
  return (
    <nav className="phone-app__tabs" aria-hidden="true">
      {tabs.map((tab) => (
        <span
          key={tab.id}
          className={`phone-app__tab${active === tab.id ? ' phone-app__tab--active' : ''}`}
        >
          <span className="phone-app__tab-icon">{tab.icon}</span>
          {tab.label}
        </span>
      ))}
    </nav>
  )
}

type SpotState = 'occupied' | 'available' | 'selected'

type FloorSpot = {
  id: string
  state: SpotState
  carTone?: 'gray' | 'white'
}

const FLOOR_LEFT: FloorSpot[] = [
  { id: 'A1', state: 'occupied', carTone: 'gray' },
  { id: 'A2', state: 'available' },
  { id: 'A3', state: 'occupied', carTone: 'white' },
  { id: 'A4', state: 'occupied', carTone: 'white' },
  { id: 'A5', state: 'available' },
]

const FLOOR_RIGHT: FloorSpot[] = [
  { id: 'B1', state: 'available' },
  { id: 'B2', state: 'available' },
  { id: 'B3', state: 'occupied', carTone: 'white' },
  { id: 'B4', state: 'occupied', carTone: 'white' },
  { id: 'B5', state: 'available' },
]

function ParkingSpotCell({ spot }: { spot: FloorSpot }) {
  return (
    <div
      className={[
        'phone-app__parking-spot',
        spot.state === 'occupied' ? 'phone-app__parking-spot--occupied' : '',
        spot.state === 'available' ? 'phone-app__parking-spot--available' : '',
      ].join(' ')}
    >
      {spot.state === 'occupied' && (
        <TopDownSedanCar
          className="phone-app__parking-car"
          tone={spot.carTone ?? 'white'}
        />
      )}
      {spot.state === 'available' && (
        <>
          <span className="phone-app__parking-spot-id">{spot.id}</span>
          <span className="phone-app__parking-spot-label">Available</span>
        </>
      )}
    </div>
  )
}

function ParkingFloorPlan() {
  return (
    <div className="phone-app__floor-plan">
      <div className="phone-app__floor-col">
        {FLOOR_LEFT.map((spot) => (
          <ParkingSpotCell key={spot.id} spot={spot} />
        ))}
      </div>
      <div className="phone-app__floor-aisle" aria-hidden="true">
        <span className="phone-app__floor-aisle-label">Entrances</span>
        <div className="phone-app__floor-aisle-line">
          <span className="phone-app__floor-aisle-arrow">↑</span>
          <span className="phone-app__floor-aisle-dash" />
          <span className="phone-app__floor-aisle-arrow">↓</span>
        </div>
      </div>
      <div className="phone-app__floor-col">
        {FLOOR_RIGHT.map((spot) => (
          <ParkingSpotCell key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  )
}

function MapScreen() {
  return (
    <div className="phone-app">
      <PhoneStatusBar />
      <header className="phone-app__header">
        <button type="button" className="phone-app__back" aria-hidden="true">
          ←
        </button>
        <div className="phone-app__header-text">
          <h3>Central Tower</h3>
          <p>Basement · Zone B2</p>
        </div>
        <span className="phone-app__avatar" aria-hidden="true">
          NT
        </span>
      </header>

      <div className="phone-app__search" aria-hidden="true">
        <span>🔍</span>
        Search slot ID or plate…
      </div>

      <div className="phone-app__chips" aria-hidden="true">
        {['B1', 'B2', 'B3', 'B4'].map((level) => (
          <span
            key={level}
            className={`phone-app__chip${level === 'B2' ? ' phone-app__chip--active' : ''}`}
          >
            {level}
          </span>
        ))}
      </div>

      <div className="phone-app__stats" aria-hidden="true">
        <div className="phone-app__stat">
          <strong>18</strong>
          <span>Free</span>
        </div>
        <div className="phone-app__stat">
          <strong>42</strong>
          <span>Occupied</span>
        </div>
        <div className="phone-app__stat">
          <strong>60</strong>
          <span>Total</span>
        </div>
      </div>

      <div className="phone-app__body">
        <h4 className="phone-app__floor-title" aria-hidden="true">
          Choose a Parking Spot
        </h4>
        <div className="phone-app__map-card">
          <ParkingFloorPlan />
        </div>
      </div>
      <PhoneTabBar active="map" />
    </div>
  )
}

function BookingScreen() {
  const levels = [
    { id: 'B1', name: 'Tenants', free: 42, total: 80, iconClass: 'phone-app__level-icon--b1' },
    { id: 'B2', name: 'Visitors', free: 18, total: 60, iconClass: 'phone-app__level-icon--b2', active: true },
    { id: 'B3', name: 'EV / VIP', free: 6, total: 20, iconClass: 'phone-app__level-icon--b3' },
  ]

  return (
    <div className="phone-app phone-app--booking">
      <PhoneStatusBar />
      <header className="phone-app__header">
        <button type="button" className="phone-app__back" aria-hidden="true">
          ←
        </button>
        <div className="phone-app__header-text">
          <h3>Book a bay</h3>
          <p>Step 2 of 3</p>
        </div>
      </header>

      <div className="phone-app__steps" aria-hidden="true">
        <div className="phone-app__step phone-app__step--done" />
        <div className="phone-app__step phone-app__step--current" />
        <div className="phone-app__step" />
      </div>

      <div className="phone-app__body">
        <div className="phone-app__list">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`phone-app__level-card${level.active ? ' phone-app__level-card--active' : ''}`}
              aria-hidden="true"
            >
              <span className={`phone-app__level-icon ${level.iconClass}`}>{level.id}</span>
              <div className="phone-app__level-info">
                <strong>
                  {level.id} — {level.name}
                </strong>
                <span>{level.free} slots available</span>
                <div className="phone-app__level-meta">
                  {level.total - level.free} occupied · {level.total} total
                </div>
              </div>
              <span className="phone-app__level-check" />
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="phone-app__cta" aria-hidden="true">
        Confirm B2 · Visitor bay
      </button>
      <PhoneTabBar active="bookings" />
    </div>
  )
}

function CtaScreen() {
  return (
    <div className="phone-app phone-app--success">
      <PhoneStatusBar />
      <div className="phone-app__body phone-app__body--success">
        <div className="phone-app__success-icon" aria-hidden="true">
          ✓
        </div>
        <h3 className="phone-app__success-title">Building connected</h3>
        <p className="phone-app__success-sub">
          All 4 basement levels are synced with the admin portal. Residents can book slots in
          real time.
        </p>

        <div className="phone-app__sync-cards" aria-hidden="true">
          <div className="phone-app__sync-card">
            <strong>4</strong>
            <span>Levels</span>
          </div>
          <div className="phone-app__sync-card">
            <strong>1.2k</strong>
            <span>Slots</span>
          </div>
        </div>

        <div className="phone-app__notif" aria-hidden="true">
          <strong>New booking</strong> — Unit 1204 reserved B2-A09 for 2h
        </div>
      </div>

      <button type="button" className="phone-app__cta" aria-hidden="true">
        Open dashboard
      </button>
      <PhoneTabBar active="profile" />
    </div>
  )
}
