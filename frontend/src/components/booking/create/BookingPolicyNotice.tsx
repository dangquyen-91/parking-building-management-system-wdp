const BOOKING_POLICIES = [
  'Vui lòng kiểm tra chính xác email, biển số xe và thời gian đặt chỗ trước khi thanh toán.',
  'Booking chỉ áp dụng cho đúng biển số đã đăng ký. Thông tin sai khiến booking không thể xác nhận hoặc sử dụng sẽ không được hoàn tiền.',
  'Bạn phải check-in trước giờ ra dự kiến. Sau thời điểm này, booking sẽ hết hạn, chỗ không còn được giữ và khoản thanh toán không được hoàn lại.',
  'Booking đã thanh toán không thể tự hủy, thay đổi thông tin hoặc hoàn tiền.',
  'Booking chưa hoàn tất thanh toán trong vòng 15 phút có thể tự động bị hủy.',
  'Thời gian đỗ vượt quá thời lượng đã thanh toán sẽ phát sinh thêm phí; thời gian không sử dụng khi rời bãi sớm sẽ không được hoàn lại.',
]

export function BookingPolicyNotice() {
  return (
    <section
      className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-50"
      aria-labelledby="booking-policy-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-lg"
          aria-hidden="true"
        >
          !
        </span>
        <div className="min-w-0">
          <h3 id="booking-policy-title" className="font-bold">
            Lưu ý chính sách đặt chỗ
          </h3>
          <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-100/75">
            Vui lòng đọc kỹ trước khi chuyển sang bước thanh toán.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 pl-4 text-sm leading-6">
        {BOOKING_POLICIES.map((policy) => (
          <li key={policy} className="list-disc pl-1 marker:text-amber-500">
            {policy}
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-amber-200/80 pt-3 text-xs leading-5 text-amber-800 dark:border-amber-500/20 dark:text-amber-100/75">
        Nếu lỗi phát sinh từ hệ thống hoặc phía bãi xe, vui lòng liên hệ quản trị viên để được hỗ trợ.
      </p>
    </section>
  )
}
