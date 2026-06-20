import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminPageShell,
  AdminSubscriptionFilters,
  AdminSubscriptionList,
  AdminSubscriptionStats,
  type AdminSubscriptionStatusFilter,
  type AdminSubscriptionVehicleFilter,
} from '../../components/admin'
import { adminApi, type AdminSubscription } from '../../services/adminApi'
import { isSubscriptionExpiringSoon } from '../../utils/managerSubscriptionUi'

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [activePlates, setActivePlates] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AdminSubscriptionStatusFilter>('all')
  const [vehicleType, setVehicleType] = useState<AdminSubscriptionVehicleFilter>('all')
  const [snapshotTime, setSnapshotTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSubscriptions = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [subscriptionData, sessionData] = await Promise.all([
        adminApi.getSubscriptions({ page: 1, limit: 100 }),
        adminApi.getSessions({ page: 1, limit: 100 }),
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
      if (vehicleType !== 'all' && subscription.vehicleType !== vehicleType) return false
      if (status === 'expiring' && !isSubscriptionExpiringSoon(subscription, snapshotTime)) return false
      if (status !== 'all' && status !== 'expiring' && subscription.status !== status) return false
      if (!normalizedQuery) return true

      const owner = subscription.userId && typeof subscription.userId !== 'string' ? subscription.userId : null
      return [subscription.licensePlate, owner?.fullName, owner?.email, owner?.phone]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase('vi-VN').includes(normalizedQuery))
    })
  }, [query, snapshotTime, status, subscriptions, vehicleType])

  return (
    <AdminPageShell
      eyebrow="Admin // Gói cư dân"
      title="Người dùng gói"
      description="Theo dõi người đã đăng ký, thời hạn gói, phương tiện và trạng thái sử dụng bãi xe."
      actions={
        <button
          type="button"
          disabled={loading}
          onClick={() => void loadSubscriptions()}
          className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      }
    >
      <AdminSubscriptionStats
        subscriptions={subscriptions}
        activePlates={activePlates}
        snapshotTime={snapshotTime}
      />

      <section className="liquid-glass-card mb-5 rounded-lg p-4">
        <AdminSubscriptionFilters
          query={query}
          status={status}
          vehicleType={vehicleType}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onVehicleTypeChange={setVehicleType}
        />
      </section>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => void loadSubscriptions()}>
            Thử lại
          </button>
        </div>
      )}

      <AdminSubscriptionList
        subscriptions={filteredSubscriptions}
        activePlates={activePlates}
        snapshotTime={snapshotTime}
        loading={loading}
      />
    </AdminPageShell>
  )
}
