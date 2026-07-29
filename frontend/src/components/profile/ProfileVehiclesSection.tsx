import { useState, type FormEvent } from 'react'
import type { AuthUser, UserVehicle } from '../../services/authApi'
import { userApi, type AddVehiclePayload } from '../../services/userApi'

type ProfileVehiclesSectionProps = {
  vehicles: UserVehicle[]
  isLoading: boolean
  onUserChange: (user: AuthUser) => void
}

const MAX_VEHICLES = 5
const PLATE_PATTERN = /^[A-Z0-9.-]{4,12}$/

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/\s+/g, '')
}

export function ProfileVehiclesSection({ vehicles, isLoading, onUserChange }: ProfileVehiclesSectionProps) {
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState<AddVehiclePayload['vehicleType']>('motorcycle')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const normalizedPlate = normalizePlate(licensePlate)
  const hasReachedLimit = vehicles.length >= MAX_VEHICLES

  async function handleAddVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!PLATE_PATTERN.test(normalizedPlate)) {
      setError('Biển số phải có từ 4–12 ký tự, chỉ gồm chữ, số, dấu chấm hoặc dấu gạch ngang.')
      return
    }

    if (vehicles.some((vehicle) => normalizePlate(vehicle.licensePlate) === normalizedPlate)) {
      setError('Biển số này đã có trong danh sách phương tiện của bạn.')
      return
    }

    setIsAdding(true)

    try {
      const response = await userApi.addVehicle({ licensePlate: normalizedPlate, vehicleType })
      onUserChange(response.user)
      setLicensePlate('')
      setMessage(`Đã thêm biển số ${normalizedPlate}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm biển số lúc này.')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemoveVehicle(vehicle: UserVehicle) {
    if (!window.confirm(`Xóa biển số ${vehicle.licensePlate} khỏi tài khoản?`)) return

    setRemovingId(vehicle._id)
    setError(null)
    setMessage(null)

    try {
      const response = await userApi.removeVehicle(vehicle._id)
      onUserChange(response.user)
      setMessage(`Đã xóa biển số ${vehicle.licensePlate}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa biển số lúc này.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section className="liquid-glass-card mt-6 overflow-hidden rounded-lg">
      <div className="border-b border-theme bg-linear-to-r from-sky-500/10 via-cyan-500/5 to-transparent p-5 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="border-l-4 border-sky-500 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
              Phương tiện của tôi
            </p>
            <h2 className="mt-1 text-xl font-bold text-fg">Quản lý biển số xe</h2>
            <p className="mt-2 text-sm text-muted">Lưu biển số để nhập nhanh khi đặt chỗ hoặc đăng ký gói cư dân.</p>
          </div>
          <span className="w-fit rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-200">
            {vehicles.length}/{MAX_VEHICLES} phương tiện
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form className="rounded-lg border border-theme bg-page/55 p-4 md:p-5" onSubmit={handleAddVehicle}>
          <h3 className="text-base font-bold text-fg">Thêm biển số mới</h3>
          <p className="mt-1 text-xs leading-5 text-muted">Chọn loại xe và nhập đúng biển số được cấp.</p>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold text-fg">Loại phương tiện</legend>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-badge p-1.5">
              {(['motorcycle', 'car'] as const).map((type) => {
                const isSelected = vehicleType === type
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setVehicleType(type)}
                    className={`h-10 rounded-md text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                        : 'text-muted hover:bg-page hover:text-fg'
                    }`}
                  >
                    {type === 'motorcycle' ? 'Xe máy' : 'Ô tô'}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <label className="mt-4 grid gap-2">
            <span className="text-sm font-semibold text-fg">Biển số xe</span>
            <input
              value={licensePlate}
              onChange={(event) => {
                setLicensePlate(event.target.value.toUpperCase())
                setError(null)
                setMessage(null)
              }}
              required
              minLength={4}
              maxLength={12}
              disabled={hasReachedLimit || isAdding}
              autoComplete="off"
              spellCheck={false}
              className="h-12 rounded-lg border border-theme bg-page px-4 text-base font-black uppercase tracking-[0.08em] text-fg outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-subtle focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ví dụ: 51G-882.14"
            />
          </label>

          <button
            type="submit"
            disabled={hasReachedLimit || isAdding || !licensePlate.trim()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-linear-to-r from-sky-600 to-cyan-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? 'Đang thêm...' : hasReachedLimit ? 'Đã đạt giới hạn 5 xe' : 'Thêm phương tiện'}
          </button>
        </form>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-fg">Danh sách đã lưu</h3>
            <span className="text-xs text-muted">Tối đa {MAX_VEHICLES} xe</span>
          </div>

          {message && (
            <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-100" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-100" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải danh sách phương tiện...</div>
          ) : vehicles.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-sky-500/30 bg-sky-500/5 p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-sky-500/10 text-2xl" aria-hidden="true">⌁</span>
              <p className="mt-3 font-bold text-fg">Chưa có phương tiện</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted">Biển số bạn thêm sẽ xuất hiện tại đây để quản lý thuận tiện hơn.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {vehicles.map((vehicle) => (
                <article key={vehicle._id} className="group relative overflow-hidden rounded-lg border border-theme bg-badge p-4 transition hover:border-sky-500/30 hover:shadow-md">
                  <span className={`absolute inset-y-0 left-0 w-1 ${vehicle.vehicleType === 'car' ? 'bg-violet-500' : 'bg-sky-500'}`} />
                  <div className="flex items-start justify-between gap-3 pl-1">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black tracking-[0.08em] text-fg">{vehicle.licensePlate}</p>
                      <p className="mt-1 text-xs font-semibold text-muted">{vehicle.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemoveVehicle(vehicle)}
                      disabled={removingId === vehicle._id}
                      aria-label={`Xóa biển số ${vehicle.licensePlate}`}
                      className="rounded-md border border-rose-500/20 bg-rose-500/5 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-300"
                    >
                      {removingId === vehicle._id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
