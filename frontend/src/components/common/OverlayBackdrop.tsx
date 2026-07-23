type OverlayBackdropProps = {
  onClose: () => void
  label: string
  className?: string
}

export function OverlayBackdrop({
  onClose,
  label,
  className = 'lg:hidden fixed inset-0 z-40 bg-overlay backdrop-blur-[2px]',
}: OverlayBackdropProps) {
  return (
    <button type="button" className={className} aria-label={label} onClick={onClose} />
  )
}
