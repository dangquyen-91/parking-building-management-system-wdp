import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const FEATURES = [
  {
    title: 'Theo dõi chỗ trống',
    body: 'Xem trạng thái từng tầng và ô đỗ theo thời gian thực.',
    tag: 'GIÁM SÁT',
    accent: 'from-sky-500/22',
    bar: 'from-sky-500 to-cyan-400',
    tagTone: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
    size: 'sm:col-span-2 lg:col-span-7',
  },
  {
    title: 'Phân bổ cho cư dân',
    body: 'Gán ô theo căn hộ, loại xe và chính sách vận hành.',
    tag: 'KIỂM SOÁT',
    accent: 'from-violet-500/22',
    bar: 'from-violet-500 to-fuchsia-500',
    tagTone: 'bg-violet-500/15 text-violet-700 dark:text-violet-200',
    size: 'lg:col-span-5',
  },
  {
    title: 'Xác thực khách',
    body: 'Ra vào bằng QR hoặc biển số, không cần vé giấy.',
    tag: 'RA VÀO',
    accent: 'from-emerald-500/22',
    bar: 'from-emerald-500 to-lime-400',
    tagTone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
    size: 'lg:col-span-5',
  },
  {
    title: 'Báo cáo doanh thu',
    body: 'Theo dõi doanh thu, lưu lượng và tỷ lệ lấp đầy.',
    tag: 'BÁO CÁO',
    accent: 'from-amber-500/22',
    bar: 'from-amber-500 to-orange-500',
    tagTone: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
    size: 'sm:col-span-2 lg:col-span-7',
  },
] as const

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="features"
      eyebrow="Năng lực // Tính năng"
      title="Bốn công cụ. Một trải nghiệm vận hành."
      description="Đủ mạnh cho ban quản lý, đủ đơn giản cho nhân viên tại cổng."
      tone="base"
    >
      <motion.div
        ref={ref}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12"
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
            className={`liquid-glass-card group relative min-h-56 overflow-hidden rounded-3xl bg-gradient-to-br ${f.accent} via-transparent to-transparent p-6 ${f.size}`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.bar}`} />
            <div className={`absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br ${f.bar} opacity-15 blur-2xl`} />
            <span className={`relative rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${f.tagTone}`}>
              {f.tag}
            </span>
            <h3 className="mt-12 text-2xl font-black tracking-tight text-fg">
              {f.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{f.body}</p>
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  )
}
