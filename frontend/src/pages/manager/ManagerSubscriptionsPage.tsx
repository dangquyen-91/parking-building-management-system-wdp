import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ManagerPageHeader,
  ManagerSubscriptionFilters,
  ManagerSubscriptionList,
  ManagerSubscriptionStats,
  type ManagerSubscriptionParkingFilter,
  type ManagerSubscriptionStatusFilter,
  type ManagerSubscriptionVehicleFilter,
} from '../../components/manager'
import { managerGateLogsApi } from '../../services/managerGateLogsApi'
import {
  managerSubscriptionsApi,
  type ManagerSubscription,
} from '../../services/managerSubscriptionsApi'
import { isSubscriptionExpiringSoon } from '../../utils/managerSubscriptionUi'

export function ManagerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ManagerSubscription[]>([])
  const [activePlates, setActivePlates] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ManagerSubscriptionStatusFilter>('all')
  const [vehicleType, setVehicleType] = useState<ManagerSubscriptionVehicleFilter>('all')
  const [planId, setPlanId] = useState('all')
  const [parkingStatus, setParkingStatus] = useState<ManagerSubscriptionParkingFilter>('all')
  const [snapshotTime, setSnapshotTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSubscriptions = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [subscriptionData, sessionData] = await Promise.all([
        managerSubscriptionsApi.getSubscriptions({ page: 1, limit: 100 }),
        managerGateLogsApi.getActiveSessions({ page: 1, limit: 100 }),
      ])
      setSubscriptions(subscriptionData.subscriptions)
      setActivePlates(new Set(sessionData.sessions.map((session) => session.licensePlate)))
      setSnapshotTime(Date.now())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách người dùng gói.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSubscriptions(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadSubscriptions])

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN')

    return subscriptions.filter((subscription) => {
      const owner = subscription.userId && typeof subscription.userId !== 'string' ? subscription.userId : null
      const plan = subscription.planId && typeof subscription.planId !== 'string' ? subscription.planId : null
      const slot = subscription.slotId && typeof subscription.slotId !== 'string' ? subscription.slotId : null
      const isInParkingLot = activePlates.has(subscription.licensePlate)

      if (vehicleType !== 'all' && subscription.vehicleType !== vehicleType) return false
      if (status === 'expiring' && !isSubscriptionExpiringSoon(subscription, snapshotTime)) return false
      if (status !== 'all' && status !== 'expiring' && subscription.status !== status) return false
      if (planId !== 'all' && plan?._id !== planId) return false
      if (parkingStatus === 'inside' && !isInParkingLot) return false
      if (parkingStatus === 'outside' && isInParkingLot) return false
      if (!normalizedQuery) return true

      return [
        subscription.licensePlate,
        owner?.fullName,
        owner?.email,
        owner?.phone,
        plan?.name,
        plan?.code,
        slot?.slotCode,
      ]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase('vi-VN').includes(normalizedQuery))
    })
  }, [activePlates, parkingStatus, planId, query, snapshotTime, status, subscriptions, vehicleType])

  const planOptions = useMemo(() => {
    const options = new Map<string, string>()

    subscriptions.forEach((subscription) => {
      const plan = subscription.planId && typeof subscription.planId !== 'string' ? subscription.planId : null
      if (plan?._id) options.set(plan._id, plan.name || plan.code || 'Gói không tên')
    })

    return Array.from(options, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label, 'vi-VN'),
    )
  }, [subscriptions])

  const hasActiveFilters =
    Boolean(query.trim()) ||
    status !== 'all' ||
    vehicleType !== 'all' ||
    planId !== 'all' ||
    parkingStatus !== 'all'

  function resetFilters() {
    setQuery('')
    setStatus('all')
    setVehicleType('all')
    setPlanId('all')
    setParkingStatus('all')
  }

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Gói gửi xe"
        title="Người dùng gói"
        description="Theo dõi người đã đăng ký, thời hạn gói, phương tiện và trạng thái sử dụng bãi xe."
        actions={
          <Button
            type="button"
            disabled={loading}
            onClick={() => void loadSubscriptions()}
            className="h-10 rounded-lg border border-neutral-950 bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-60 dark:border-white/15 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        }
      />

      <ManagerSubscriptionStats subscriptions={subscriptions} activePlates={activePlates} snapshotTime={snapshotTime} />

      <section className="bg-card text-card-foreground ring-1 ring-border mb-5 rounded-lg p-4">
        <ManagerSubscriptionFilters
          query={query}
          status={status}
          vehicleType={vehicleType}
          planId={planId}
          parkingStatus={parkingStatus}
          planOptions={planOptions}
          hasActiveFilters={hasActiveFilters}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onVehicleTypeChange={setVehicleType}
          onPlanIdChange={setPlanId}
          onParkingStatusChange={setParkingStatus}
          onReset={resetFilters}
        />
      </section>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <Button type="button" className="font-semibold underline" onClick={() => void loadSubscriptions()}>
            Thử lại
          </Button>
        </div>
      )}

      <ManagerSubscriptionList
        subscriptions={filteredSubscriptions}
        activePlates={activePlates}
        snapshotTime={snapshotTime}
        loading={loading}
      />
    </div>
  )
}



