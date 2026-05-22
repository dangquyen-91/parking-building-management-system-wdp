import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const STEPS = [
  {
    step: '01',
    title: 'Connect telemetry',
    body: 'Plug LPR cameras, gate controllers, and occupancy sensors into the building core via secure API endpoints.',
  },
  {
    step: '02',
    title: 'Map every bay',
    body: 'Import floor plans and assign slots to tenants, visitors, and EV zones with live status on each space.',
  },
  {
    step: '03',
    title: 'Operate in flow',
    body: 'Route vehicles to open bays, validate guests digitally, and export utilization reports from one dashboard.',
  },
] as const

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="how-it-works"
      eyebrow="Process // How it works"
      title="From legacy gates to live spatial control"
      description="Three phases to modernize basement parking without ripping out existing hardware."
      tone="alt"
    >
      <motion.div
        ref={ref}
        className="grid md:grid-cols-3 gap-6"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {STEPS.map((item, i) => (
          <motion.div
            key={item.step}
            custom={i * 0.12}
            variants={reduceMotion ? undefined : fadeUp}
            className="liquid-glass-card rounded-2xl p-6 flex flex-col"
          >
            <span className="text-[10px] tracking-[0.2em] text-gray-400 font-mono">
              {item.step}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white uppercase tracking-tight">
              {item.title}
            </h3>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed flex-1">
              {item.body}
            </p>
            <motion.span
              className="mt-6 inline-block w-8 h-px bg-white/30"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              style={{ originX: 0 }}
            />
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
