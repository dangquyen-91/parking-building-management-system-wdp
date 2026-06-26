import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { scaleIn, staggerContainer } from '../../assets/motion/variants'
import { AUTH_STORAGE_KEYS } from '../../services/authApi'
import { userSubscriptionApi, type Plan } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../utils/subscriptionUi'
import { SectionShell } from './SectionShell'

const PLAN_STYLES = [
  {
    accent: 'from-sky-500/25',
    color: 'text-sky-600 dark:text-sky-300',
    bar: 'from-sky-500 to-cyan-400',
  },
  {
    accent: 'from-violet-500/25',
    color: 'text-violet-600 dark:text-violet-300',
    bar: 'from-violet-500 to-fuchsia-500',
  },
  {
    accent: 'from-emerald-500/25',
    color: 'text-emerald-600 dark:text-emerald-300',
    bar: 'from-emerald-500 to-lime-400',
  },
  {
    accent: 'from-amber-500/25',
    color: 'text-amber-600 dark:text-amber-300',
    bar: 'from-amber-500 to-orange-400',
  },
] as const

function sortResidentPlans(plans: Plan[]) {
  return [...plans].sort((a, b) => {
    if (a.vehicleType !== b.vehicleType) {
      return a.vehicleType === 'motorcycle' ? -1 : 1
    }

    return a.durationDays - b.durationDays || a.price - b.price || a.name.localeCompare(b.name)
  })
}

export function ResidentPlansSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
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
        <div className="rounded-2xl border border-theme bg-badge p-5 text-sm text-muted">
          Đang tải danh sách gói cư dân...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-rose-100">
          {error}
        </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="rounded-2xl border border-theme bg-badge p-5 text-sm text-muted">
          Hiện chưa có gói cư dân nào đang hoạt động.
        </div>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <motion.div
          ref={ref}
          className={gridClassName}
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {plans.map((plan, index) => {
            const style = PLAN_STYLES[index % PLAN_STYLES.length]
            const purchasePath = `/subscriptions?vehicleType=${plan.vehicleType}&planId=${plan._id}`

            return (
              <motion.article
                key={plan._id}
                custom={index * 0.1}
                variants={reduceMotion ? undefined : scaleIn}
                whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                className={`liquid-glass-card relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.accent} via-transparent to-transparent p-6`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.bar}`} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${style.color}`}>
                    {VEHICLE_LABELS[plan.vehicleType]}
                  </p>
                  <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-muted">
                    {plan.durationDays} ngày
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-black text-fg">{plan.name}</h3>
                <p className="mt-3 text-3xl font-black text-fg">{formatSubscriptionCurrency(plan.price)}</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {plan.description || 'Gói cư dân đang hoạt động, có thể đăng ký và thanh toán trực tuyến.'}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                  <span className="rounded-full bg-badge px-3 py-1">Mã gói: {plan.code}</span>
                  <span className="rounded-full bg-badge px-3 py-1">Đang mở bán</span>
                </div>
                <Link
                  to={isAuthenticated ? purchasePath : '/login'}
                  state={isAuthenticated ? undefined : { from: purchasePath }}
                  className="mt-6 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5"
                >
                  {isAuthenticated ? 'Mua gói này' : 'Đăng nhập để mua'}
                </Link>
              </motion.article>
            )
          })}
        </motion.div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to={isAuthenticated ? '/my-subscriptions' : '/login'}
          state={isAuthenticated ? undefined : { from: '/my-subscriptions' }}
          className="inline-flex rounded-full border border-theme-strong px-6 py-3 text-sm font-medium text-fg transition-opacity hover:opacity-80"
        >
          Xem gói của tôi
        </Link>
      </div>
    </SectionShell>
  )
}
