import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp } from '../../assets/motion/variants'

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <section id="demo" className="section-surface relative overflow-hidden border-t border-theme px-6 py-20 md:px-12 lg:px-16 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.16),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          className="liquid-glass-card relative overflow-hidden rounded-[2rem] border border-violet-500/20 px-8 py-12 text-center shadow-2xl md:px-14 md:py-16"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={reduceMotion ? undefined : fadeUp}
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            Triển khai // Bản mẫu
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-fg uppercase leading-tight max-w-2xl mx-auto"
            style={{ letterSpacing: '-0.02em' }}
          >
            Xem tòa nhà của bạn trên Parking Simulator
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted max-w-xl mx-auto">
            Đặt lịch xem thử cùng sơ đồ tầng của bạn. Chúng tôi mô phỏng ô đỗ,
            cổng và quy tắc cư dân trước khi bạn triển khai chính thức.
          </p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <Link
              to="/booking"
              className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5"
            >
              Đặt chỗ
            </Link>
            <Link
              to="/login"
              className="inline-flex text-sm font-medium text-fg border border-theme-strong hover:opacity-80 transition-opacity rounded-full px-6 py-3"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex text-sm font-medium text-muted hover:text-fg transition-colors rounded-full px-6 py-3"
            >
              Đăng ký
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
