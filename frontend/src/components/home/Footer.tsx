import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeIn } from '../../assets/motion/variants'

const FOOTER_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#resources', label: 'Resources' },
  { href: '#blog', label: 'Blog' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
] as const

export function Footer() {
  return (
    <footer className="section-surface-alt border-t border-theme px-6 md:px-12 lg:px-16 py-12">
      <motion.div
        className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div>
          <p className="text-sm font-medium text-fg">Parking Simulator</p>
          <p className="mt-1 text-xs text-subtle">
            Building parking, managed in one place.
          </p>
          <p className="mt-4 text-[10px] text-faint uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} Parking Simulator
          </p>
        </div>

        <nav
          className="flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Footer navigation"
        >
          {FOOTER_LINKS.map((link) =>
            'to' in link ? (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-muted hover:text-fg transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-muted hover:text-fg transition-colors"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      </motion.div>
    </footer>
  )
}
