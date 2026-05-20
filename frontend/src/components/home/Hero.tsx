import { HeroParkingBg } from './HeroParkingBg'

export function Hero() {
  return (
    <section className="home-hero" aria-labelledby="hero-heading">
      <div className="landing__container">
        <div className="home-hero__card">
          <HeroParkingBg />
          <div className="home-hero__overlay" aria-hidden="true" />
          <div className="home-hero__content">
            <h1 id="hero-heading" className="home-hero__title">
              Building parking, managed in one place
            </h1>
            <p className="home-hero__subtitle">
              Monitor every basement level, assign slots to tenants, and guide
              vehicles to open bays — all within your property, not the city.
            </p>
            <a
              href="#demo"
              className="btn btn--primary btn--lg"
              aria-label="Request a demo of the building parking management system"
            >
              Request Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
