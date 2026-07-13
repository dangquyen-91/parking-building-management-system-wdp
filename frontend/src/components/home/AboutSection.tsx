import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { SectionShell } from './SectionShell'

const HIGHLIGHTS = [
  {
    label: 'Chỗ trống trực tiếp',
    value: 'Thời gian thực',
    detail: 'Biết chính xác khu vực nào còn chỗ.',
    number: '01',
  },
  {
    label: 'Kiểm soát ra vào',
    value: 'Hợp nhất',
    detail: 'Cổng, biển số và quyền cư dân trên một màn hình.',
    number: '02',
  },
  {
    label: 'Luồng khách',
    value: 'Tự động',
    detail: 'Không vé giấy, ít thao tác và ít hàng chờ.',
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
        {HIGHLIGHTS.map((item, index) => (
          <motion.div
            key={item.label}
            custom={index * 0.08}
            variants={reduceMotion ? undefined : fadeUp}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <Badge className="w-fit" variant="secondary">{item.number}</Badge>
                <CardTitle>{item.value}</CardTitle>
                <CardDescription>{item.label}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {item.detail}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  )
}
