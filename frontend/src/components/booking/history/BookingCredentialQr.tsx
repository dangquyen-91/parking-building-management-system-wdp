import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { Booking } from '../../../services/bookingApi'

export function BookingCredentialQr({ booking }: { booking: Booking }) {
  const [dataUrl, setDataUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let ignore = false
    if (!booking.qrToken) return

    setFailed(false)
    void QRCode.toDataURL(booking.qrToken, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => {
        if (!ignore) setDataUrl(url)
      })
      .catch(() => {
        if (!ignore) setFailed(true)
      })

    return () => {
      ignore = true
    }
  }, [booking.qrToken])

  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-2 shadow-sm dark:border-emerald-700/50">
      <div className="flex aspect-square w-32 items-center justify-center sm:w-36">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR booking ${booking.licensePlate}`}
            className="block size-full object-contain"
          />
        ) : (
          <p className="px-2 text-center text-xs font-medium text-slate-500">
            {failed ? 'Không thể tạo QR. Vui lòng tải lại trang.' : 'Đang tạo QR...'}
          </p>
        )}
      </div>
      <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        QR vào / ra
      </p>
    </div>
  )
}
