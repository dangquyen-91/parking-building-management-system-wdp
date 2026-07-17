import { ArrowRight, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fadeIn } from '../../assets/motion/variants'
import { BrandLink } from '../common'
import { Button } from '../ui/button'

const PRODUCT_LINKS = [
  { href: '#about', label: 'Giới thiệu' },
  { href: '#features', label: 'Tính năng' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#resident-plans', label: 'Gói cư dân' },
] as const

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Đăng nhập' },
  { to: '/register', label: 'Tạo tài khoản' },
  { to: '/my-bookings', label: 'Lịch sử đặt chỗ' },
  { to: '/my-subscriptions', label: 'Gói của tôi' },
] as const

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 px-6 text-white dark:border-white/10 md:px-12 lg:px-16">
      <div className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-violet-600/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-sky-500/15 blur-3xl" aria-hidden="true" />

      <motion.div
        className="relative mx-auto max-w-7xl py-12 lg:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <BrandLink className="inline-flex items-center gap-2 text-base font-bold text-white transition-opacity hover:opacity-80" />
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Nền tảng quản lý bãi đỗ thông minh cho tòa nhà, giúp cư dân đặt chỗ và vận hành phương tiện thuận tiện hơn mỗi ngày.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="size-4 text-sky-400" aria-hidden="true" />
              Hệ thống bãi đỗ tòa nhà
            </div>
          </div>

          <FooterColumn title="Khám phá">
            {PRODUCT_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-slate-300 transition-all hover:translate-x-1 hover:text-white">
                {link.label}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Tài khoản">
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-slate-300 transition-all hover:translate-x-1 hover:text-white">
                {link.label}
              </Link>
            ))}
          </FooterColumn>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Bắt đầu ngay</p>
            <p className="mt-4 text-lg font-bold leading-snug">Tìm và đặt chỗ đỗ xe chỉ trong vài bước.</p>
            <Button asChild className="mt-5 w-full justify-between bg-white text-slate-950 hover:bg-sky-100">
              <Link to="/booking">
                Đặt chỗ ngay
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Parking System. All rights reserved.</p>
          <p className="uppercase tracking-[0.16em]">Smart parking · Better living</p>
        </div>
      </motion.div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav className="flex flex-col items-start gap-3" aria-label={title}>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      {children}
    </nav>
  )
}
