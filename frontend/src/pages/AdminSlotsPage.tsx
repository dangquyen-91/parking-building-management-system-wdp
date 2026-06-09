import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi } from '../services/adminApi'
import type { ParkingRow } from '../services/managerParkingRowApi'
import type { ParkingSlot } from '../services/managerParkingSlotApi'

export function AdminSlotsPage() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [rows, setRows] = useState<ParkingRow[]>([])
  const [slotTotal, setSlotTotal] = useState(0)
  const [rowTotal, setRowTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadInventory() {
      try {
        setIsLoading(true)
        setError('')
        const [slotsResponse, rowsResponse] = await Promise.all([
          adminApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
          adminApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' }),
        ])

        if (!ignore) {
          setSlots(slotsResponse.slots)
          setRows(rowsResponse.rows)
          setSlotTotal(slotsResponse.total)
          setRowTotal(rowsResponse.total)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load parking inventory')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadInventory()

    return () => {
      ignore = true
    }
  }, [])

  const availableSlots = slots.filter((slot) => slot.status === 'empty').length
  const reservedSlots = slots.filter((slot) => slot.status === 'reserved').length
  const maintenanceCount = slots.filter((slot) => slot.status === 'maintenance').length + rows.filter((row) => row.status === 'maintenance').length

  function getLocation(floorId: ParkingSlot['floorId'] | ParkingRow['floorId']) {
    if (typeof floorId === 'string') return floorId
    const building = typeof floorId.buildingId === 'object' ? floorId.buildingId?.name : undefined
    return `${building ?? 'Building'} / Floor ${floorId.floorNumber ?? '-'}`
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Slots"
      title="Slot Inventory"
      description="Admin xem tat ca slot theo toa nha, tang, khu, loai xe, booking gan voi slot va trang thai hien tai."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard label="Car slots" value={isLoading ? '-' : slotTotal} detail="Visible to admin" />
        <AdminStatCard label="Motorcycle rows" value={isLoading ? '-' : rowTotal} detail="Managed separately" />
        <AdminStatCard label="Reserved" value={reservedSlots} detail="Held by booking" />
        <AdminStatCard label="Maintenance" value={maintenanceCount} detail={`${availableSlots} car slots empty`} />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Inventory</p>
            <h2 className="mt-1 text-base font-semibold text-fg">All Parking Slots</h2>
          </div>
          <select className="auth-input h-10 rounded-lg border px-3 text-sm text-fg" defaultValue="All buildings">
            <option>All buildings</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Slot</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Vehicle</th>
                <th className="px-3 py-3 font-medium">Booking</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={5}>Loading parking inventory...</td>
                </tr>
              )}
              {!isLoading && slots.length === 0 && rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={5}>No parking inventory found.</td>
                </tr>
              )}
              {!isLoading && slots.map((slot) => (
                <tr key={slot._id} className="align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-fg">{slot.slotCode}</p>
                    <p className="mt-1 text-xs text-subtle">{slot._id}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{getLocation(slot.floorId)}</td>
                  <td className="px-3 py-4 font-medium text-fg">{slot.vehicleType}</td>
                  <td className="px-3 py-4 text-muted">{slot.note ?? '-'}</td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={slot.status} />
                  </td>
                </tr>
              ))}
              {!isLoading && rows.map((row) => (
                <tr key={row._id} className="align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-fg">{row.rowCode}</p>
                    <p className="mt-1 text-xs text-subtle">{row._id}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{getLocation(row.floorId)}</td>
                  <td className="px-3 py-4 font-medium text-fg">motorcycle</td>
                  <td className="px-3 py-4 text-muted">{row.occupiedCount}/{row.capacity}</td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  )
}
