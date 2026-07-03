import { ManagerStatCard } from '../common/ManagerStatCard'

type ManagerComplaintStatsProps = {
  stats: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
}

export function ManagerComplaintStats({ stats }: ManagerComplaintStatsProps) {
  return (
    <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard label="Tổng khiếu nại" value={stats.total} detail="Tất cả báo cáo đậu sai chỗ" tone="sky" />
      <ManagerStatCard label="Mới gửi" value={stats.open} detail="Cần tiếp nhận và gọi chủ xe" tone="amber" />
      <ManagerStatCard label="Đang xử lý" value={stats.inProgress} detail="Đã có người phụ trách" tone="violet" />
      <ManagerStatCard label="Đã xử lý" value={stats.resolved} detail="Khiếu nại đã được đóng" tone="emerald" />
    </section>
  )
}
