type StaffGateToastProps = {
  message: string
  onClose: () => void
}

export function StaffGateToast({ message, onClose }: StaffGateToastProps) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[70] flex w-[min(26rem,calc(100vw-2.5rem))] items-start gap-3 rounded-2xl border border-sky-400/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
        i
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Thông báo cổng xe</p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </aside>
  )
}
