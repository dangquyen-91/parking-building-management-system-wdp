import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const RESIDENT_PLANS = [
  {
    name: 'Gói xe máy cư dân',
    price: 'Theo tháng',
    description: 'Dùng sức chứa chung, không cần chọn ô cố định.',
    highlights: ['Nhận diện biển số cư dân', 'Check-in nhanh tại cổng'],
    accent: 'from-sky-500/25',
    color: 'text-sky-600 dark:text-sky-300',
    bar: 'from-sky-500 to-cyan-400',
  },
  {
    name: 'Gói ô tô cư dân',
    price: 'Theo tháng',
    description: 'Giữ một ô đỗ riêng trên tầng cư dân.',
    highlights: ['Ô đỗ cố định', 'Theo dõi hiệu lực online'],
    accent: 'from-violet-500/25',
    color: 'text-violet-600 dark:text-violet-300',
    bar: 'from-violet-500 to-fuchsia-500',
  },
  {
    name: 'Thanh toán online',
    price: 'PayOS',
    description: 'Thanh toán trực tuyến và kích hoạt tự động.',
    highlights: ['Ghi nhận giao dịch tự động', 'Quản lý đơn đang chờ'],
    accent: 'from-emerald-500/25',
    color: 'text-emerald-600 dark:text-emerald-300',
    bar: 'from-emerald-500 to-lime-400',
  },
] as const

export function ResidentPlansSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="resident-plans"
      eyebrow="Cư dân // Gói tháng"
      title="Gói cư dân, đăng ký trong vài phút"
      description="Chọn loại xe, nhập biển số và thanh toán trực tuyến."
      tone="alt"
    >
      <motion.div
        ref={ref}
        className="grid gap-5 lg:grid-cols-3"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {RESIDENT_PLANS.map((plan, index) => (
          <motion.article
            key={plan.name}
            custom={index * 0.1}
            variants={reduceMotion ? undefined : scaleIn}
            whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
            className={`liquid-glass-card relative overflow-hidden rounded-3xl bg-gradient-to-br ${plan.accent} via-transparent to-transparent p-6 ${index === 1 ? 'border border-violet-500/30 shadow-xl shadow-violet-500/10' : ''}`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.bar}`} />
            <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${plan.color}`}>{plan.price}</p>
            <h3 className="mt-3 text-xl font-black text-fg">{plan.name}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>
            <ul className="mt-5 grid gap-2 text-sm text-muted">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${plan.bar}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/subscriptions"
          className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5"
        >
          Mua gói cư dân
        </Link>
        <Link
          to="/my-subscriptions"
          className="inline-flex rounded-full border border-theme-strong px-6 py-3 text-sm font-medium text-fg transition-opacity hover:opacity-80"
        >
          Xem gói của tôi
        </Link>
      </div>
    </SectionShell>
  )
}
