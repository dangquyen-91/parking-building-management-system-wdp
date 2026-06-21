type MyBookingsHeaderProps = {
  paid: number
  pending: number
  total: number
}

export function MyBookingsHeader({ paid, pending, total }: MyBookingsHeaderProps) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(79,70,229,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-8">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-violet-100/60 dark:bg-violet-500/10" />
      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-500">
            Không gian cá nhân // Đặt chỗ
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Đặt chỗ của tôi</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Xem lịch sử đặt chỗ được tạo bằng tài khoản của bạn, bao gồm đơn chờ thanh toán PayOS và đơn đã thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
          <StatBox
            label="Đã thanh toán"
            value={paid}
            tone="border-emerald-200 bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-500/10"
          />
          <StatBox
            label="Chờ thanh toán"
            value={pending}
            tone="border-amber-200 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-500/10"
          />
          <StatBox
            label="Tổng đơn"
            value={total}
            tone="border-sky-200 bg-sky-50 dark:border-sky-700/30 dark:bg-sky-500/10"
          />
        </div>
      </div>
    </section>
  )
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${tone}`}>
      <p className="text-xl font-bold text-fg">{value}</p>
      <p className="text-[10px] text-subtle">{label}</p>
    </div>
  )
}
