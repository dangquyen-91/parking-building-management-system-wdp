import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeIn } from '../../assets/motion/variants'
import { Button } from '../ui/button'

const FOOTER_LINKS = [
  { href: '#about', label: 'Giới thiệu' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#features', label: 'Tính năng' },
  { href: '#resident-plans', label: 'Gói cư dân' },
  { to: '/login', label: 'Đăng nhập' },
  { to: '/register', label: 'Đăng ký' },
] as const

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-6 py-12 md:px-12 lg:px-16">
      <motion.div
        className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div>
          <p className="text-sm font-medium text-foreground">Parking Simulator</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Quản lý bãi đỗ tòa nhà tại một nơi.
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            © {new Date().getFullYear()} Parking Simulator
          </p>
        </div>

        <nav className="flex flex-wrap gap-1" aria-label="Điều hướng chân trang">
          {FOOTER_LINKS.map((link) =>
            'to' in link ? (
              <Button key={link.to} variant="ghost" size="sm" asChild>
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ) : (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <a href={link.href}>{link.label}</a>
              </Button>
            ),
          )}
        </nav>
      </motion.div>
    </footer>
  )
}
