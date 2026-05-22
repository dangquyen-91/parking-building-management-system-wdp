import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Reveal } from '../../assets/motion/Reveal'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const HIGHLIGHTS = [
  {
    label: 'Live occupancy',
    value: 'Real-time',
    detail: 'Floor-by-floor slot telemetry across every basement level.',
  },
  {
    label: 'Access control',
    value: 'Unified',
    detail: 'Gates, LPR cameras, and tenant permissions in one console.',
  },
  {
    label: 'Guest flow',
    value: 'Automated',
    detail: 'Digital validation with no paper tickets or guard bottlenecks.',
  },
] as const

export function AboutSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="about"
      eyebrow="System // About"
      title="One platform for every vehicle in your building"
      description="Parking Simulator unifies monitoring, access, and reporting for premium residential and commercial properties—without replacing your existing gate hardware."
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <Reveal delay={0.1}>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            Security teams, property managers, and residents all see the same source
            of truth. From basement clearance queues to rooftop visitor bays, every
            access point feeds into a single high-contrast operational layer.
          </p>
          <p className="mt-4 text-sm md:text-base text-gray-300 leading-relaxed">
            Deploy floor maps, automated slot assignment, and occupancy alerts in
            days—not quarters. Your building keeps its existing infrastructure; we
            add the intelligence on top.
          </p>
        </Reveal>

        <motion.div
          ref={gridRef}
          className="grid gap-4"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {HIGHLIGHTS.map((item, i) => (
            <motion.article
              key={item.label}
              custom={i * 0.08}
              variants={reduceMotion ? undefined : fadeUp}
              className="liquid-glass-card rounded-2xl p-5"
            >
              <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                {item.detail}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  )
}
