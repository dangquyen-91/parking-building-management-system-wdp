import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { SectionShell } from './SectionShell'

const FEATURES = [
  {
    title: 'Theo dõi chỗ trống',
    body: 'Xem trạng thái từng tầng và ô đỗ theo thời gian thực.',
    tag: 'Giám sát',
    size: 'sm:col-span-2 lg:col-span-7',
  },
  {
    title: 'Phân bổ cho cư dân',
    body: 'Gán ô theo căn hộ, loại xe và chính sách vận hành.',
    tag: 'Kiểm soát',
    size: 'lg:col-span-5',
  },
  {
    title: 'Xác thực khách',
    body: 'Ra vào bằng QR hoặc biển số, không cần vé giấy.',
    tag: 'Ra vào',
    size: 'lg:col-span-5',
  },
  {
    title: 'Báo cáo doanh thu',
    body: 'Theo dõi doanh thu, lưu lượng và tỷ lệ lấp đầy.',
    tag: 'Báo cáo',
    size: 'sm:col-span-2 lg:col-span-7',
  },
] as const

const CARD_TONES = [
  'from-sky-500/34 ring-sky-500/45 hover:ring-sky-600/70 hover:shadow-sky-500/30',
  'from-violet-500/34 ring-violet-500/45 hover:ring-violet-600/70 hover:shadow-violet-500/30',
  'from-emerald-500/34 ring-emerald-500/45 hover:ring-emerald-600/70 hover:shadow-emerald-500/30',
  'from-amber-500/34 ring-amber-500/45 hover:ring-amber-600/70 hover:shadow-amber-500/30',
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
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            custom={index * 0.1}
            variants={reduceMotion ? undefined : scaleIn}
            className={feature.size}
          >
            <Card className={`relative h-full min-h-56 rounded-2xl bg-gradient-to-br via-card to-card shadow-lg shadow-transparent ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${CARD_TONES[index]}`}>
              <span className="absolute right-5 top-5 size-16 rounded-full bg-current opacity-[0.04] blur-xl" aria-hidden="true" />
              <CardHeader>
                <Badge className="w-fit" variant="secondary">{feature.tag}</Badge>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="max-w-sm leading-6">{feature.body}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
