import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { SectionShell } from './SectionShell'

const RESOURCES = [
  {
    title: 'Cẩm nang xử lý hàng chờ tầng hầm',
    meta: 'Hướng dẫn // Đọc 8 phút',
    href: '#',
  },
  {
    title: 'Checklist tích hợp nhận diện biển số',
    meta: 'Tài liệu // API v2',
    href: '#',
  },
  {
    title: 'Cơ bản về mô hình hóa chỗ đỗ',
    meta: 'Hội thảo // Xem lại',
    href: '#',
  },
] as const

const POSTS = [
  {
    title: 'Vì sao vé giấy không còn phù hợp với tòa nhà cao tầng',
    date: 'Tháng 5/2026',
    href: '#blog',
  },
  {
    title: 'Quy hoạch làn xe điện mà không làm mất ô đỗ cư dân',
    date: 'Tháng 4/2026',
    href: '#blog',
  },
] as const

export function ResourcesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <>
      <SectionShell
        id="resources"
        eyebrow="Thư viện // Tài nguyên"
        title="Hướng dẫn cho ban quản lý và đội bảo vệ"
        tone="base"
      >
        <motion.div
          ref={ref}
          className="grid md:grid-cols-3 gap-5"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {RESOURCES.map((r, i) => (
            <motion.a
              key={r.title}
              href={r.href}
              custom={i * 0.1}
              variants={reduceMotion ? undefined : fadeUp}
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="liquid-glass-card rounded-2xl p-6 block group"
            >
              <p className="text-[10px] tracking-[0.15em] text-subtle uppercase">
                {r.meta}
              </p>
              <h3 className="mt-3 text-sm font-semibold text-fg group-hover:text-fg">
                {r.title}
              </h3>
              <span className="mt-4 inline-flex text-xs text-muted group-hover:text-fg transition-colors">
                Đọc →
              </span>
            </motion.a>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell
        id="blog"
        eyebrow="Nhật ký // Blog"
        title="Tin mới từ bàn vận hành"
        tone="alt"
        className="pt-0"
      >
        <motion.div
          className="grid md:grid-cols-2 gap-5"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          {POSTS.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.href}
              custom={i * 0.1}
              variants={reduceMotion ? undefined : fadeUp}
              className="rounded-2xl border border-theme-strong p-6 hover:border-white/40 transition-colors block"
            >
              <p className="text-[10px] text-subtle uppercase tracking-[0.15em]">
                {post.date}
              </p>
              <h3 className="mt-2 text-base font-medium text-fg">{post.title}</h3>
            </motion.a>
          ))}
        </motion.div>
      </SectionShell>
    </>
  )
}
