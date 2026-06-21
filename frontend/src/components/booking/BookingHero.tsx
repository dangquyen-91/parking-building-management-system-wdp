import { formatBookingCurrency } from './bookingUtils'

type BookingHeroProps = {
  durationHours: number
  estimatedFee: number
}

export function BookingHero({ durationHours, estimatedFee }: BookingHeroProps) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(79,70,229,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-8">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-violet-100/60 dark:bg-violet-500/10" />

      <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-700/40 dark:bg-violet-500/10 dark:text-violet-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Đặt trước · Vào bãi nhanh hơn
          </div>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-fg md:text-4xl">
            Đặt chỗ ô tô
            <span className="text-violet-600 dark:text-violet-300"> nhanh chóng.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Tạo đơn đặt chỗ ô tô trả trước bằng số điện thoại, biển số, thời gian đến và thời lượng. Hệ thống kiểm tra sức
          chứa theo khung giờ và không yêu cầu chọn slot cụ thể.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[25rem]">
          <HeroStat label="Loại xe" value="Ô tô" tone="border-violet-200 bg-violet-50 dark:border-violet-700/30 dark:bg-violet-500/10" />
          <HeroStat label="Thời lượng" value={`${durationHours}h`} tone="border-sky-200 bg-sky-50 dark:border-sky-700/30 dark:bg-sky-500/10" />
          <HeroStat label="Tạm tính" value={formatBookingCurrency(estimatedFee)} tone="border-amber-200 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-500/10" />
        </div>
      </div>
    </section>
  )
}

function HeroStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${tone}`}>
      <p className="truncate text-base font-bold text-fg md:text-lg">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-subtle">{label}</p>
    </div>
  )
}
