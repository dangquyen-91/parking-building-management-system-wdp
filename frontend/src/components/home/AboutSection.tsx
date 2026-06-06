import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Reveal } from '../../assets/motion/Reveal'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const HIGHLIGHTS = [
  {
    label: 'Chỗ trống trực tiếp',
    value: 'Thời gian thực',
    detail: 'Theo dõi từng ô đỗ theo từng tầng hầm.',
  },
  {
    label: 'Kiểm soát ra vào',
    value: 'Hợp nhất',
    detail: 'Cổng, camera nhận diện biển số và quyền cư dân trong một bảng điều khiển.',
  },
  {
    label: 'Luồng khách',
    value: 'Tự động',
    detail: 'Xác thực số, không cần vé giấy và giảm tải cho bảo vệ.',
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
      title="Một nền tảng cho mọi phương tiện trong tòa nhà"
      description="Parking Simulator hợp nhất giám sát, ra vào và báo cáo cho tòa nhà dân cư và thương mại cao cấp mà không cần thay thế phần cứng cổng hiện có."
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <Reveal delay={0.1}>
          <p className="text-sm md:text-base text-muted leading-relaxed">
            Đội bảo vệ, ban quản lý và cư dân cùng nhìn vào một nguồn dữ liệu thống nhất.
            Từ hàng chờ ở tầng hầm đến khu đỗ khách trên cao, mọi điểm ra vào đều được
            đưa về một lớp vận hành rõ ràng.
          </p>
          <p className="mt-4 text-sm md:text-base text-muted leading-relaxed">
            Triển khai bản đồ tầng, phân bổ ô đỗ tự động và cảnh báo chỗ trống chỉ trong
            vài ngày. Tòa nhà vẫn giữ hạ tầng hiện có; hệ thống bổ sung lớp thông minh
            phía trên.
          </p>
        </Reveal>

        <motion.div
          ref={gridRef}
          className="grid gap-4"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {HIGHLIGHTS.map((item, i) => (
            <motion.article
              key={item.label}
              custom={i * 0.08}
              variants={reduceMotion ? undefined : fadeUp}
              className="liquid-glass-card rounded-2xl p-5"
            >
              <p className="text-[10px] tracking-[0.15em] text-subtle uppercase">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-fg">{item.value}</p>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {item.detail}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  )
}
