import { LogoIcon, SocialIcon } from './icons'

const QUICK_LINKS = [
  { href: '#about', label: 'About Us' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#search', label: 'Slot Browser' },
  { href: '#demo', label: 'Book Demo' },
] as const

const SOCIAL = [
  { type: 'facebook' as const, href: 'https://facebook.com', label: 'Facebook' },
  { type: 'twitter' as const, href: 'https://twitter.com', label: 'Twitter' },
  { type: 'linkedin' as const, href: 'https://linkedin.com', label: 'LinkedIn' },
  { type: 'instagram' as const, href: 'https://instagram.com', label: 'Instagram' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="about" className="home-footer">
      <div className="landing__container">
        <div className="home-footer__grid">
          <div className="home-footer__brand">
            <a href="/" className="home-header__logo" aria-label="Parking — home">
              <span className="home-header__logo-icon" aria-hidden="true">
                <LogoIcon />
              </span>
              Parking
            </a>
            <p>
              Building parking management for a single property — basement maps,
              tenant slots, and live occupancy for your operations team.
            </p>
          </div>

          <div className="home-footer__col">
            <h3>Quick Links</h3>
            <ul>
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-footer__col">
            <h3>Contact</h3>
            <ul>
              <li>
                <a href="mailto:hello@parking.app">hello@parking.app</a>
              </li>
              <li>
                <a href="tel:+18005551234">+1 (800) 555-1234</a>
              </li>
              <li>88 Central Tower, Basement Ops, Floor 1</li>
            </ul>
          </div>

          <div className="home-footer__col">
            <h3>Follow Us</h3>
            <div className="home-footer__social">
              {SOCIAL.map(({ type, href, label }) => (
                <a
                  key={type}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Parking on ${label}`}
                >
                  <SocialIcon type={type} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="home-footer__bottom">
          <p>© {year} Parking. All rights reserved.</p>
          <nav className="home-footer__legal" aria-label="Legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
