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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { SectionShell } from './SectionShell'

const STATS = [
  { label: 'Tòa nhà triển khai', value: 48, suffix: '+' },
  { label: 'Ô đỗ được giám sát', value: 12400, suffix: '' },
  { label: 'Thời gian hoạt động cổng', value: 98, suffix: '%' },
  { label: 'Thời gian xử lý TB', value: 2, suffix: 's' },
] as const

const STAT_TONES = [
  'from-violet-500/38 ring-violet-500/50 text-violet-800 dark:text-violet-100',
  'from-sky-500/38 ring-sky-500/50 text-sky-800 dark:text-sky-100',
  'from-emerald-500/38 ring-emerald-500/50 text-emerald-800 dark:text-emerald-100',
  'from-amber-500/38 ring-amber-500/50 text-amber-800 dark:text-amber-100',
] as const

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
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

  const displayValue = reduceMotion && inView ? value : display
  const formatted = value >= 1000 ? displayValue.toLocaleString() : String(displayValue)

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
        className="grid grid-cols-2 gap-5 lg:grid-cols-4"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            custom={index * 0.08}
            variants={reduceMotion ? undefined : fadeUp}
          >
            <Card className={`h-full rounded-2xl bg-gradient-to-br via-card to-card text-center shadow-lg shadow-transparent ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${STAT_TONES[index]}`}>
              <CardHeader>
                <CardTitle className="text-3xl font-bold md:text-4xl">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground/65">{stat.label}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
