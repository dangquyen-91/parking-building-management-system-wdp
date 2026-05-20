import { PhoneMockup } from './PhoneMockup'

export function CtaBanner() {
  return (
    <section className="home-cta" aria-labelledby="cta-heading">
      <div className="landing__container">
        <div className="home-cta__banner">
          <div>
            <h2 id="cta-heading" className="home-cta__title">
              Ready to modernize parking in your building?
            </h2>
            <form
              className="home-cta__form"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Contact form for building demo"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Work email
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                className="home-cta__input"
                placeholder="Work email (property team)"
                autoComplete="email"
                required
              />
              <button
                type="submit"
                className="btn btn--white"
                aria-label="Request a building parking demo"
              >
                Book Demo
              </button>
            </form>
          </div>
          <div className="home-cta__phone">
            <PhoneMockup
              variant="cta"
              alt="Building parking admin welcome screen"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
