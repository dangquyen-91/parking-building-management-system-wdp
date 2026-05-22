import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const FEATURES = [
  {
    title: 'Occupancy radar',
    body: 'Live heatmaps per floor with color-coded bay status and dwell-time alerts.',
    tag: 'MONITOR',
  },
  {
    title: 'Tenant assignments',
    body: 'Bind slots to units, rotate overflow rules, and enforce reserved EV lanes.',
    tag: 'CONTROL',
  },
  {
    title: 'Guest validation',
    body: 'QR and plate-based entry with automatic expiry—no ticket machines required.',
    tag: 'ACCESS',
  },
  {
    title: 'Revenue reports',
    body: 'Export utilization, overstay fees, and monthly occupancy PDFs for stakeholders.',
    tag: 'REPORT',
  },
] as const

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="features"
      eyebrow="Capability // Features"
      title="Built for operators who run tight ships"
      description="Every module shares the same liquid-glass UI language and real-time data backbone."
      tone="base"
    >
      <motion.div
        ref={ref}
        className="grid sm:grid-cols-2 gap-5"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            custom={i * 0.1}
            variants={reduceMotion ? undefined : scaleIn}
            whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
            className="liquid-glass-card rounded-2xl p-6 group"
          >
            <span className="text-[10px] tracking-[0.15em] text-gray-400 uppercase bg-white/5 rounded-full px-2.5 py-1">
              {f.tag}
            </span>
            <h3 className="mt-4 text-base font-semibold text-white uppercase tracking-tight">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">{f.body}</p>
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  )
}
