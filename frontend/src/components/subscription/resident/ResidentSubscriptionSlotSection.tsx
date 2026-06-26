import type {
  AvailableMotorcycleSubscriptions,
  AvailableSubscriptionFloor,
  VehicleType,
} from '../../../services/userSubscriptionApi'

type ResidentSubscriptionSlotSectionProps = {
  vehicleType: VehicleType
  carFloors: AvailableSubscriptionFloor[]
  motorcycleAvailability: AvailableMotorcycleSubscriptions | null
  selectedSlotId: string
  onSlotChange: (value: string) => void
  stepNumber?: number
}

export function ResidentSubscriptionSlotSection({
  vehicleType,
  carFloors,
  motorcycleAvailability,
  selectedSlotId,
  onSlotChange,
  stepNumber = 3,
}: ResidentSubscriptionSlotSectionProps) {
  if (vehicleType === 'motorcycle') {
    return (
      <section className="liquid-glass-card overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-theme bg-gradient-to-r from-amber-500/15 via-transparent to-transparent p-5 md:p-6">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-sm font-black text-white shadow-lg shadow-amber-500/20">
            {stepNumber}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Vị trí xe máy</p>
            <h2 className="mt-1 text-xl font-bold text-fg">Xe máy sử dụng khu vực chung</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Gói xe máy cư dân dùng sức chứa chung của tầng xe máy cư dân. Staff sẽ ghi nhận xe vào theo hàng còn chỗ.
            </p>
          </div>
        </div>

        {motorcycleAvailability && (
          <div className="grid gap-px bg-[color:var(--border)] text-sm md:grid-cols-3">
            <div className="bg-page p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Tổng sức chứa</p>
              <p className="mt-2 text-3xl font-black text-fg">{motorcycleAvailability.totalCapacity}</p>
            </div>
            <div className="bg-page p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Đã đăng ký</p>
              <p className="mt-2 text-3xl font-black text-fg">{motorcycleAvailability.soldCount}</p>
            </div>
            <div className="bg-emerald-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Còn có thể đăng ký</p>
              <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-300">
                {motorcycleAvailability.availableCount}
              </p>
            </div>
          </div>
        )}
      </section>
    )
  }

  const selectedSlot = carFloors
    .flatMap((floor) => floor.slots.map((slot) => ({ slot, floor })))
    .find((item) => item.slot._id === selectedSlotId)

  return (
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-theme bg-gradient-to-r from-amber-500/15 via-transparent to-transparent p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-sm font-black text-white shadow-lg shadow-amber-500/20">
            {stepNumber}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Ô đỗ cố định</p>
            <h2 className="mt-1 text-xl font-bold text-fg">Chọn ô đỗ cố định cho ô tô</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Chỉ các ô trống ở tầng cư dân mới được chọn. Ô đã chọn sẽ được giữ trong lúc chờ thanh toán.
            </p>
          </div>
        </div>

        {selectedSlot && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
            <p className="font-semibold text-fg">Đã chọn {selectedSlot.slot.slotCode}</p>
            <p className="mt-1 text-xs text-muted">
              {selectedSlot.floor.floor.building?.name ? `${selectedSlot.floor.floor.building.name} / ` : ''}
              Tầng {selectedSlot.floor.floor.floorNumber}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 p-5 md:p-6">
        {carFloors.length === 0 ? (
          <div className="rounded-xl border border-theme bg-badge p-5 text-sm text-muted">
            Chưa có ô đỗ ô tô cư dân còn trống.
          </div>
        ) : (
          carFloors.map((floor) => (
            <div key={floor.floor._id} className="rounded-xl border border-theme bg-badge p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-fg">
                    {floor.floor.building?.name ? `${floor.floor.building.name} / ` : ''}
                    Tầng {floor.floor.floorNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted">{floor.availableCount} ô còn trống</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))]">
                {floor.slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    disabled={!slot.available}
                    className={[
                      'h-14 rounded-xl border px-3 text-xs font-bold transition-all',
                      selectedSlotId === slot._id
                        ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg'
                        : 'border-theme bg-page/60 text-fg hover:-translate-y-0.5 hover:bg-ghost',
                      !slot.available ? 'cursor-not-allowed opacity-45' : '',
                    ].join(' ')}
                    onClick={() => onSlotChange(slot._id)}
                  >
                    {slot.slotCode}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
