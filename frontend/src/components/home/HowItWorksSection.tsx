import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const STEPS = [
  {
    step: '01',
    title: 'Kết nối dữ liệu',
    body: 'Kết nối camera nhận diện biển số, bộ điều khiển cổng và cảm biến chỗ trống vào hệ thống lõi qua API bảo mật.',
  },
  {
    step: '02',
    title: 'Lập bản đồ từng ô',
    body: 'Nhập sơ đồ tầng và gán ô đỗ cho cư dân, khách vãng lai và khu xe điện với trạng thái trực tiếp.',
  },
  {
    step: '03',
    title: 'Vận hành liền mạch',
    body: 'Điều hướng xe đến ô trống, xác thực khách bằng dữ liệu số và xuất báo cáo sử dụng từ một bảng điều khiển.',
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
      title="Từ cổng truyền thống đến kiểm soát không gian thời gian thực"
      description="Ba giai đoạn để hiện đại hóa bãi đỗ tầng hầm mà không cần tháo bỏ phần cứng hiện có."
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
            className="liquid-glass-card rounded-2xl p-6 flex flex-col"
          >
            <span className="text-[10px] tracking-[0.2em] text-subtle font-mono">
              {item.step}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-fg uppercase tracking-tight">
              {item.title}
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed flex-1">
              {item.body}
            </p>
            <motion.span
              className="mt-6 inline-block w-8 h-px bg-line-accent"
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
