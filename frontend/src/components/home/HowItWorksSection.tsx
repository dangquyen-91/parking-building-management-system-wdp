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
            <Card className="h-full min-h-60">
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
