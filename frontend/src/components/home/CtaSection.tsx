import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp } from '../../assets/motion/variants'

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <section id="demo" className="section-surface px-6 md:px-12 lg:px-16 py-20 lg:py-28 border-t border-theme">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          className="liquid-glass-card rounded-3xl px-8 py-12 md:px-14 md:py-16 text-center"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={reduceMotion ? undefined : fadeUp}
        >
          <p className="text-[10px] tracking-[0.2em] text-subtle uppercase mb-4">
            Deploy // Demo
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-fg uppercase leading-tight max-w-2xl mx-auto"
            style={{ letterSpacing: '-0.02em' }}
          >
            See your building on Parking Simulator
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted max-w-xl mx-auto">
            Book a walkthrough with your floor plans. We model bays, gates, and
            tenant rules before you commit to a rollout.
          </p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <Link
              to="/booking"
              className="inline-flex text-sm font-medium bg-btn-primary text-btn-primary-fg hover:opacity-90 transition-opacity rounded-full px-6 py-3"
            >
              Book Slot
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
