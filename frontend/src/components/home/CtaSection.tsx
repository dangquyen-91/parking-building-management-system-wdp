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
    <section id="demo" className="border-t bg-background px-6 py-20 md:px-12 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={reduceMotion ? undefined : fadeUp}
        >
          <Card>
            <CardContent className="px-8 py-12 text-center md:px-14 md:py-16">
              <Badge variant="secondary" className="mb-4">Triển khai // Bản mẫu</Badge>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold uppercase leading-tight text-foreground md:text-4xl lg:text-5xl">
                Xem tòa nhà của bạn trên Parking Simulator
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
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
