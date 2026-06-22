import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const STEPS = [
  {
    step: '01',
    title: 'Kết nối dữ liệu',
    body: 'Đồng bộ camera, cổng và cảm biến hiện có.',
    tone: 'from-sky-500/25',
    color: 'text-sky-600 dark:text-sky-300',
    bar: 'bg-sky-500',
  },
  {
    step: '02',
    title: 'Lập bản đồ từng ô',
    body: 'Thiết lập tầng, khu vực và quy tắc phân bổ.',
    tone: 'from-violet-500/25',
    color: 'text-violet-600 dark:text-violet-300',
    bar: 'bg-violet-500',
  },
  {
    step: '03',
    title: 'Vận hành liền mạch',
    body: 'Theo dõi xe, chỗ trống và doanh thu tức thì.',
    tone: 'from-emerald-500/25',
    color: 'text-emerald-600 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  },
] as const

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="how-it-works"
      eyebrow="Quy trình // Cách hoạt động"
      title="Ba bước để vận hành thông minh hơn"
      description="Kết nối nhanh, cấu hình rõ và sử dụng ngay."
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
            className={`group relative flex min-h-60 flex-col overflow-hidden rounded-3xl border border-theme bg-gradient-to-br ${item.tone} via-badge to-badge p-6`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${item.bar}`} />
            <span className={`text-6xl font-black tracking-tighter ${item.color}`}>
              {item.step}
            </span>
            <h3 className="mt-auto text-xl font-black text-fg">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              {item.body}
            </p>
            <motion.span
              className={`mt-6 inline-block h-1 w-12 rounded-full ${item.bar}`}
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
