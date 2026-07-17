import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { SectionShell } from './SectionShell'

const STEPS = [
  {
    step: '01',
    title: 'Kết nối dữ liệu',
    body: 'Đồng bộ camera, cổng và cảm biến hiện có.',
  },
  {
    step: '02',
    title: 'Lập bản đồ từng ô',
    body: 'Thiết lập tầng, khu vực và quy tắc phân bổ.',
  },
  {
    step: '03',
    title: 'Vận hành liền mạch',
    body: 'Theo dõi xe, chỗ trống và doanh thu tức thì.',
  },
] as const

const STEP_TONES = [
  'from-violet-500/32 ring-violet-500/45 hover:ring-violet-600/70 hover:shadow-violet-500/30',
  'from-sky-500/32 ring-sky-500/45 hover:ring-sky-600/70 hover:shadow-sky-500/30',
  'from-emerald-500/32 ring-emerald-500/45 hover:ring-emerald-600/70 hover:shadow-emerald-500/30',
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
        className="grid gap-6 md:grid-cols-3"
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {STEPS.map((item, index) => (
          <motion.div
            key={item.step}
            custom={index * 0.12}
            variants={reduceMotion ? undefined : fadeUp}
          >
            <Card className={`relative h-full min-h-60 rounded-2xl bg-gradient-to-br via-card to-card shadow-lg shadow-transparent ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${STEP_TONES[index]}`}>
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-violet-500 via-sky-500 to-emerald-500" aria-hidden="true" />
              <CardHeader>
                <Badge className="w-fit" variant="secondary">{item.step}</Badge>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-6">{item.body}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
