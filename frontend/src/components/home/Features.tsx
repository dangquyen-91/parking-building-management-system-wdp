import { CheckIcon } from './icons'
import { PhoneMockup } from './PhoneMockup'
import { ScrollReveal } from './ScrollReveal'

const FEATURES_ONE = [
  'Live slot map for each basement level (B1, B2, B3…)',
  'Assign bays to tenants, staff, and visitors',
  'Entry guidance to the nearest available spot',
] as const

const FEATURES_TWO = [
  'Monthly permits and visitor passes per unit',
  'Extend stay or release a slot from the admin desk',
  'Occupancy reports and billing export per building',
] as const

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="home-features__list">
      {items.map((item) => (
        <li key={item}>
          <span className="home-features__check" aria-hidden="true">
            <CheckIcon />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Features() {
  return (
    <>
      <ScrollReveal delay={120}>
      <section
        id="features"
        className="home-features"
        aria-labelledby="features-heading-1"
      >
        <div className="landing__container home-features__row">
          <div className="home-features__text">
            <span className="home-features__eyebrow">For property teams</span>
            <h2 id="features-heading-1" className="home-features__title">
              End the basement parking chaos
            </h2>
            <p className="home-features__desc">
              Replace spreadsheets and walkie-talkies with one dashboard for your
              building. See which slots are free, reserved, or overdue in real time.
            </p>
            <FeatureList items={FEATURES_ONE} />
            <a
              href="#learn-more"
              className="btn btn--outline-green"
              aria-label="Learn more about building parking features"
            >
              Learn more
            </a>
          </div>
          <div className="home-features__visual">
            <PhoneMockup
              variant="map"
              alt="Building parking app showing choose a parking spot floor plan"
            />
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delay={160}>
      <section
        id="how-it-works"
        className="home-features"
        aria-labelledby="features-heading-2"
      >
        <div className="landing__container home-features__row home-features__row--reverse">
          <div className="home-features__text">
            <span className="home-features__eyebrow">How it works</span>
            <h2 id="features-heading-2" className="home-features__title">
              Configure once. Operate daily.
            </h2>
            <p className="home-features__desc">
              Upload your floor plan, define zones and pricing, then let tenants
              book from the resident app while security monitors the lobby display.
            </p>
            <FeatureList items={FEATURES_TWO} />
            <a
              href="#how-it-works"
              className="btn btn--outline-green"
              aria-label="See how building parking management works"
            >
              Learn more
            </a>
          </div>
          <div className="home-features__visual">
            <PhoneMockup
              variant="booking"
              alt="Resident app selecting a parking slot on basement level B2"
            />
          </div>
        </div>
      </section>
      </ScrollReveal>
    </>
  )
}
