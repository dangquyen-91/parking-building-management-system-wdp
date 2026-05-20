export function StatsBar() {
  return (
    <section className="home-stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        Building parking at a glance
      </h2>
      <div className="landing__container home-stats__grid">
        <article className="home-stats__highlight">
          <strong>One building. Every basement level.</strong>
          <span>
            Centralize slot maps, access rules, and occupancy for your entire
            property.
          </span>
        </article>

        <article className="home-stats__item">
          <h3>99% Live accuracy</h3>
          <p>Occupancy synced with sensors and entry gates on each floor.</p>
          <div className="home-stats__badges">
            <span className="home-stats__badge" aria-label="Admin web dashboard">
              Admin Portal
            </span>
            <span className="home-stats__badge" aria-label="Resident mobile app">
              Resident App
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}
