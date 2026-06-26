import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { easeOut, fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const STATS = [
  { label: 'Tòa nhà triển khai', value: 48, suffix: '+', tone: 'from-violet-500/30', text: 'text-violet-600 dark:text-violet-300', bar: 'bg-violet-500' },
  { label: 'Ô đỗ được giám sát', value: 12400, suffix: '', tone: 'from-sky-500/30', text: 'text-sky-600 dark:text-sky-300', bar: 'bg-sky-500' },
  { label: 'Thời gian hoạt động cổng', value: 98, suffix: '%', tone: 'from-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-300', bar: 'bg-emerald-500' },
  { label: 'Thời gian xử lý TB', value: 2, suffix: 's', tone: 'from-amber-500/30', text: 'text-amber-600 dark:text-amber-300', bar: 'bg-amber-500' },
] as const

function AnimatedNumber({
  value,
  suffix,
  inView,
}: {
  value: number
  suffix: string
  inView: boolean
}) {
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)

  useMotionValueEvent(rounded, 'change', setDisplay)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) return
    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: easeOut,
    })
    return () => controls.stop()
  }, [inView, value, motionValue, reduceMotion])

  const visibleValue = reduceMotion && inView ? value : display
  const formatted =
    value >= 1000 ? visibleValue.toLocaleString() : String(visibleValue)

  return (
    <span className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      eyebrow="Dữ liệu // Thống kê"
      title="Số liệu từ các tòa nhà đang vận hành"
      tone="alt"
    >
      <motion.div
        ref={ref}
        className="grid grid-cols-2 lg:grid-cols-4 gap-5"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i * 0.08}
            variants={reduceMotion ? undefined : fadeUp}
            className={`liquid-glass-card relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.tone} via-transparent to-transparent p-6 text-center transition-transform hover:-translate-y-1`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${stat.bar}`} />
            <div className={`mx-auto mb-4 size-3 rounded-full ${stat.bar}`} />
            <p className={`text-3xl font-black tracking-tight md:text-4xl ${stat.text}`}>
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                inView={inView}
              />
            </p>
            <p className="mt-2 text-xs text-subtle uppercase tracking-[0.12em]">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
