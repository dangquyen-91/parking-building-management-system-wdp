import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const RESIDENT_PLANS = [
  {
    name: 'Gói xe máy cư dân',
    price: 'Theo tháng',
    description: 'Dùng sức chứa chung của tầng xe máy cư dân, không cần chọn ô cố định.',
    highlights: ['Biển số được nhận diện là cư dân', 'Staff check-in nhanh tại cổng', 'Phù hợp xe máy gửi thường xuyên'],
  },
  {
    name: 'Gói ô tô cư dân',
    price: 'Theo tháng',
    description: 'Chọn ô đỗ cố định trên tầng cư dân để giữ chỗ riêng cho biển số của bạn.',
    highlights: ['Có ô đỗ cố định', 'Ưu tiên tầng cư dân', 'Theo dõi hiệu lực gói trong tài khoản'],
  },
  {
    name: 'Thanh toán online',
    price: 'PayOS',
    description: 'Tạo đơn mua gói và thanh toán trực tuyến, trạng thái được cập nhật sau khi giao dịch thành công.',
    highlights: ['Tự động ghi nhận gói', 'Quản lý đơn đang chờ thanh toán', 'Có thể hủy đơn pending'],
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
      title="Mua gói gửi xe cư dân ngay trên hệ thống"
      description="Người dùng chọn loại xe, nhập biển số và thanh toán gói cư dân. Khi gói có hiệu lực, cổng sẽ tự nhận diện biển số là cư dân."
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
            className="liquid-glass-card rounded-lg p-6"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{plan.price}</p>
            <h3 className="mt-3 text-lg font-semibold text-fg">{plan.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{plan.description}</p>
            <ul className="mt-5 grid gap-3 text-sm text-muted">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-btn-primary" />
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
          className="inline-flex rounded-full bg-btn-primary px-6 py-3 text-sm font-medium text-btn-primary-fg transition-opacity hover:opacity-90"
        >
          Mua gói cư dân
        </Link>
        <Link
          to="/my-bookings"
          className="inline-flex rounded-full border border-theme-strong px-6 py-3 text-sm font-medium text-fg transition-opacity hover:opacity-80"
        >
          Xem gói của tôi
        </Link>
      </div>
    </SectionShell>
  )
}
