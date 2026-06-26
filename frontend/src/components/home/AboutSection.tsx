import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const HIGHLIGHTS = [
  {
    label: 'Chỗ trống trực tiếp',
    value: 'Thời gian thực',
    detail: 'Biết chính xác khu vực nào còn chỗ.',
    tone: 'from-sky-500/20',
    color: 'text-sky-600 dark:text-sky-300',
    bar: 'bg-sky-500',
    number: '01',
  },
  {
    label: 'Kiểm soát ra vào',
    value: 'Hợp nhất',
    detail: 'Cổng, biển số và quyền cư dân trên một màn hình.',
    tone: 'from-violet-500/20',
    color: 'text-violet-600 dark:text-violet-300',
    bar: 'bg-violet-500',
    number: '02',
  },
  {
    label: 'Luồng khách',
    value: 'Tự động',
    detail: 'Không vé giấy, ít thao tác và ít hàng chờ.',
    tone: 'from-emerald-500/20',
    color: 'text-emerald-600 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    number: '03',
  },
] as const

export function AboutSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="about"
      eyebrow="Hệ thống // Giới thiệu"
      title="Mọi hoạt động bãi xe, trong một góc nhìn"
      description="Giám sát, kiểm soát ra vào và báo cáo mà không phải thay toàn bộ hạ tầng hiện có."
    >
      <motion.div
        ref={gridRef}
        className="grid gap-4 md:grid-cols-3"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {HIGHLIGHTS.map((item, i) => (
          <motion.article
            key={item.label}
            custom={i * 0.08}
            variants={reduceMotion ? undefined : fadeUp}
            className={`liquid-glass-card group relative min-h-52 overflow-hidden rounded-3xl bg-gradient-to-br ${item.tone} via-transparent to-transparent p-6 transition-transform hover:-translate-y-1`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${item.bar}`} />
            <span className={`text-5xl font-black tracking-tighter ${item.color}`}>{item.number}</span>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-subtle">{item.label}</p>
            <p className={`mt-2 text-2xl font-black ${item.color}`}>{item.value}</p>
            <p className="mt-2 max-w-[28ch] text-sm leading-6 text-muted">{item.detail}</p>
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  )
}
