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
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [activePlates, setActivePlates] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AdminSubscriptionStatusFilter>('all')
  const [vehicleType, setVehicleType] =
    useState<AdminSubscriptionVehicleFilter>('all')
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
      setSubscriptions(subscriptionData.subscriptions ?? [])
      setActivePlates(
        new Set(
          (sessionData.sessions ?? []).map((session) => session.licensePlate),
        ),
      )
      setSnapshotTime(Date.now())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải danh sách người dùng gói.',
      )
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
      if (vehicleType !== 'all' && subscription.vehicleType !== vehicleType)
        return false
      if (
        status === 'expiring' &&
        !isSubscriptionExpiringSoon(subscription, snapshotTime)
      )
        return false
      if (
        status !== 'all' &&
        status !== 'expiring' &&
        subscription.status !== status
      )
        return false
      if (!normalizedQuery) return true

      const owner =
        subscription.userId && typeof subscription.userId !== 'string'
          ? subscription.userId
          : null
      return [
        subscription.licensePlate,
        owner?.fullName,
        owner?.email,
        owner?.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase('vi-VN').includes(normalizedQuery),
        )
    })
  }, [query, snapshotTime, status, subscriptions, vehicleType])

  return (
    <AdminPageShell
      eyebrow="Admin // Gói cư dân"
      title="Người dùng gói"
      description="Theo dõi người đã đăng ký, thời hạn gói, phương tiện và trạng thái sử dụng bãi xe."
      actions={
        <Button
          type="button"
          disabled={loading}
          onClick={() => void loadSubscriptions()}
          variant="outline"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </Button>
      }
    >
      <AdminSubscriptionStats
        subscriptions={subscriptions}
        activePlates={activePlates}
        snapshotTime={snapshotTime}
      />

      <Card className="mb-5">
        <CardContent className="p-4">
          <AdminSubscriptionFilters
            query={query}
            status={status}
            vehicleType={vehicleType}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
            onVehicleTypeChange={setVehicleType}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert
          variant="destructive"
          className="mb-5 flex items-center justify-between"
        >
          <AlertDescription>{error}</AlertDescription>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => void loadSubscriptions()}
          >
            Thử lại
          </Button>
        </Alert>
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
