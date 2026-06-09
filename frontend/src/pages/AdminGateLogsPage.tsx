import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../components/admin'
import { adminApi } from '../services/adminApi'
import type { GateSession } from '../services/staffGateApi'

function getSessionLocation(session: GateSession) {
  const slot = typeof session.slotId === 'object' ? session.slotId : null
  const row = typeof session.rowId === 'object' ? session.rowId : null

  if (slot) return slot.slotCode
  if (row) return row.rowCode
  return '-'
}

export function AdminGateLogsPage() {
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadSessions() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getSessions({ limit: 100 })
        if (!ignore) {
          setSessions(response.sessions)
          setTotal(response.total)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load gate sessions')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadSessions()

    return () => {
      ignore = true
    }
  }, [])

  const paidSessions = sessions.filter((session) => session.paymentStatus === 'paid').length
  const totalFee = sessions.reduce((sum, session) => sum + (session.fee ?? 0), 0)

  return (
    <AdminPageShell
      eyebrow="Admin // Gate Logs"
      title="Gate Activity"
      description="Admin xem cac phien xe vao/ra ma manager va staff dang theo doi."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Sessions" value={isLoading ? '-' : total} detail="Fetched from sessions API" />
        <AdminStatCard label="Paid sessions" value={isLoading ? '-' : paidSessions} detail="Payment completed" />
        <AdminStatCard label="Total fee" value={isLoading ? '-' : formatAdminCurrency(totalFee)} detail="Current page total" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Plate</th>
                <th className="px-3 py-3 font-medium">Vehicle</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Entry</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={6}>Loading gate activity...</td>
                </tr>
              )}
              {!isLoading && sessions.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={6}>No gate sessions found.</td>
                </tr>
              )}
              {!isLoading && sessions.map((session) => (
                <tr key={session._id} className="align-top">
                  <td className="px-3 py-4 font-semibold text-fg">{session.licensePlate}</td>
                  <td className="px-3 py-4 text-muted">{session.vehicleType} / {session.customerType}</td>
                  <td className="px-3 py-4 text-muted">{getSessionLocation(session)}</td>
                  <td className="px-3 py-4 text-muted">{new Date(session.entryTime).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{formatAdminCurrency(session.fee ?? 0)}</p>
                    <p className="mt-1 text-xs text-subtle">{session.paymentStatus}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={session.status} />
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
