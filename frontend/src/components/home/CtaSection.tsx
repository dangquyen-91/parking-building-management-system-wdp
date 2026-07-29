import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp } from '../../assets/motion/variants'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  return (
    <section id="demo" className="relative overflow-hidden border-t border-violet-200/60 bg-white px-6 py-20 dark:border-violet-900/35 dark:bg-linear-to-br dark:from-violet-950/35 dark:via-sky-950/25 dark:to-emerald-950/25 md:px-12 lg:px-16 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent blur-3xl dark:bg-sky-500/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={reduceMotion ? undefined : fadeUp}
        >
          <Card className="overflow-hidden border-white/70 bg-card/75 shadow-2xl shadow-violet-500/15 backdrop-blur-xl dark:border-violet-800/40">
            <CardContent className="px-8 py-12 text-center md:px-14 md:py-16">
              <Badge variant="secondary" className="mb-4">Triển khai // Bản mẫu</Badge>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold uppercase leading-tight text-slate-950 dark:bg-linear-to-r dark:from-violet-200 dark:via-sky-200 dark:to-emerald-200 dark:bg-clip-text dark:text-transparent md:text-4xl lg:text-5xl">
                Xem tòa nhà của bạn trên Parking Simulator
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-700 dark:text-muted-foreground md:text-base">
                Đặt lịch xem thử cùng sơ đồ tầng của bạn. Chúng tôi mô phỏng ô đỗ,
                cổng và quy tắc cư dân trước khi bạn triển khai chính thức.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild>
                  <Link to="/booking">Đặt chỗ</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
