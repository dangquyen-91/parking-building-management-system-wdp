import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const RESOURCES = [
  {
    title: 'Basement queue playbook',
    meta: 'Guide // 8 min read',
    href: '#',
  },
  {
    title: 'LPR integration checklist',
    meta: 'Docs // API v2',
    href: '#',
  },
  {
    title: 'Occupancy modeling 101',
    meta: 'Webinar // On demand',
    href: '#',
  },
] as const

const POSTS = [
  {
    title: 'Why paper tickets fail in high-rise towers',
    date: 'May 2026',
    href: '#blog',
  },
  {
    title: 'Mapping EV lanes without losing tenant bays',
    date: 'Apr 2026',
    href: '#blog',
  },
] as const

export function ResourcesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <>
      <SectionShell
        id="resources"
        eyebrow="Library // Resources"
        title="Guides for property and security teams"
        tone="base"
      >
        <motion.div
          ref={ref}
          className="grid md:grid-cols-3 gap-5"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {RESOURCES.map((r, i) => (
            <motion.a
              key={r.title}
              href={r.href}
              custom={i * 0.1}
              variants={reduceMotion ? undefined : fadeUp}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="liquid-glass-card rounded-2xl p-6 block group"
            >
              <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">
                {r.meta}
              </p>
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-gray-100">
                {r.title}
              </h3>
              <span className="mt-4 inline-flex text-xs text-gray-300 group-hover:text-white transition-colors">
                Read →
              </span>
            </motion.a>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell
        id="blog"
        eyebrow="Journal // Blog"
        title="Latest from the operations desk"
        tone="alt"
        className="pt-0"
      >
        <motion.div
          className="grid md:grid-cols-2 gap-5"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          {POSTS.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.href}
              custom={i * 0.1}
              variants={reduceMotion ? undefined : fadeUp}
              className="rounded-2xl border border-white/20 p-6 hover:border-white/40 transition-colors block"
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">
                {post.date}
              </p>
              <h3 className="mt-2 text-base font-medium text-white">{post.title}</h3>
            </motion.a>
          ))}
        </motion.div>
      </SectionShell>
    </>
  )
}
