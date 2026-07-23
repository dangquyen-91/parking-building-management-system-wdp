import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { AUTH_STORAGE_KEYS } from '../../services/authApi'
import { userSubscriptionApi, type Plan } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../utils/subscriptionUi'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { SectionShell } from './SectionShell'

function sortResidentPlans(plans: Plan[]) {
  return [...plans].sort((a, b) => {
    if (a.vehicleType !== b.vehicleType) {
      return a.vehicleType === 'motorcycle' ? -1 : 1
    }

    return a.durationDays - b.durationDays || a.price - b.price || a.name.localeCompare(b.name)
  })
}

export function ResidentPlansSection() {
  const reduceMotion = useReducedMotion()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const isAuthenticated = Boolean(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken))

  useEffect(() => {
    let mounted = true

    async function loadPlans() {
      try {
        setIsLoading(true)
        setError('')
        const data = await userSubscriptionApi.getPlans({ isActive: true })

        if (mounted) {
          setPlans(sortResidentPlans(data.plans))
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách gói cư dân.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadPlans()

    return () => {
      mounted = false
    }
  }, [])

  const gridClassName = useMemo(() => {
    if (plans.length <= 1) return 'grid gap-5'
    if (plans.length === 2) return 'grid gap-5 md:grid-cols-2'
    return 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
  }, [plans.length])

  return (
    <SectionShell
      id="resident-plans"
      eyebrow="Cư dân // Gói tháng"
      title="Tất cả gói cư dân đang mở bán"
      description="Xem nhanh các gói xe máy và ô tô hiện có trước khi đăng ký. Khi bấm mua, hệ thống sẽ yêu cầu đăng nhập để tiếp tục."
      tone="alt"
    >
      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <Alert>
          <AlertDescription>Hiện chưa có gói cư dân nào đang hoạt động.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <motion.div
          className={gridClassName}
          variants={reduceMotion ? undefined : staggerContainer}
          initial={false}
          animate="visible"
        >
          {plans.map((plan, index) => {
            const purchasePath = `/subscriptions?vehicleType=${plan.vehicleType}&planId=${plan._id}`

            return (
              <motion.div
                key={plan._id}
                custom={index * 0.1}
                variants={reduceMotion ? undefined : scaleIn}
              >
                <Card className="h-full rounded-2xl bg-gradient-to-br from-violet-500/30 via-card to-sky-500/22 shadow-lg shadow-transparent ring-1 ring-violet-500/45 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/30 hover:ring-violet-600/70">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge variant="secondary">{VEHICLE_LABELS[plan.vehicleType]}</Badge>
                      <Badge variant="outline">{plan.durationDays} ngày</Badge>
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-bold">{formatSubscriptionCurrency(plan.price)}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {plan.description || 'Gói cư dân đang hoạt động, có thể đăng ký và thanh toán trực tuyến.'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link
                        to={isAuthenticated ? purchasePath : '/login'}
                        state={isAuthenticated ? undefined : { from: purchasePath }}
                      >
                        {isAuthenticated ? 'Mua gói này' : 'Đăng nhập để mua'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link
            to={isAuthenticated ? '/my-subscriptions' : '/login'}
            state={isAuthenticated ? undefined : { from: '/my-subscriptions' }}
          >
            Xem gói của tôi
          </Link>
        </Button>
      </div>
    </SectionShell>
  )
}
