import type { ManagerSubscription } from '../../../services/managerSubscriptionsApi'
import { isSubscriptionExpiringSoon } from '../../../utils/managerSubscriptionUi'
import { ManagerStatCard } from '../common/ManagerStatCard'

export function ManagerSubscriptionStats({
  subscriptions,
  activePlates,
  snapshotTime,
}: {
  subscriptions: ManagerSubscription[]
  activePlates: Set<string>
  snapshotTime: number
}) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard
        label="Tổng đăng ký"
        value={subscriptions.length}
        detail={`${subscriptions.filter((item) => item.status === 'pending').length} đang chờ thanh toán`}
      />
      <ManagerStatCard
        label="Gói đang hoạt động"
        value={subscriptions.filter((item) => item.status === 'active').length}
        detail={`${subscriptions.filter((item) => item.status === 'expired').length} gói đã hết hạn`}
      />
      <ManagerStatCard
        label="Sắp hết hạn"
        value={subscriptions.filter((item) => isSubscriptionExpiringSoon(item, snapshotTime)).length}
        detail="Còn tối đa 7 ngày sử dụng"
      />
      <ManagerStatCard
        label="Xe gói trong bãi"
        value={subscriptions.filter((item) => activePlates.has(item.licensePlate)).length}
        detail="Có phiên gửi xe đang hoạt động"
      />
    </div>
  )
}


