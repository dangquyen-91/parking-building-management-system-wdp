import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const FEATURES = [
  {
    title: 'Theo dõi chỗ trống',
    body: 'Bản đồ nhiệt theo từng tầng, trạng thái ô đỗ bằng màu sắc và cảnh báo thời gian lưu lại.',
    tag: 'GIÁM SÁT',
  },
  {
    title: 'Phân bổ cho cư dân',
    body: 'Gán ô đỗ cho căn hộ, xoay vòng quy tắc quá tải và quản lý làn sạc xe điện.',
    tag: 'KIỂM SOÁT',
  },
  {
    title: 'Xác thực khách',
    body: 'Ra vào bằng mã QR và biển số với thời hạn tự động, không cần máy in vé.',
    tag: 'RA VÀO',
  },
  {
    title: 'Báo cáo doanh thu',
    body: 'Xuất báo cáo sử dụng, phí quá giờ và tỷ lệ lấp đầy hằng tháng cho các bên liên quan.',
    tag: 'BÁO CÁO',
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
      title="Thiết kế cho đội vận hành cần độ chính xác cao"
      description="Mọi module dùng chung ngôn ngữ giao diện hiện đại và nền tảng dữ liệu thời gian thực."
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
            <span className="text-[10px] tracking-[0.15em] text-subtle uppercase bg-badge rounded-full px-2.5 py-1">
              {f.tag}
            </span>
            <h3 className="mt-4 text-base font-semibold text-fg uppercase tracking-tight">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{f.body}</p>
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  )
}
