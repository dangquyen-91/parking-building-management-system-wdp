import { type RefObject, useCallback } from 'react'
import { useFocusTrap } from './useFocusTrap'
import { useLockBodyScroll } from './useLockBodyScroll'

type UseOverlayPanelOptions = {
  isOpen: boolean
  panelRef: RefObject<HTMLElement | null>
  triggerRef?: RefObject<HTMLElement | null>
  onClose: () => void
}

/**
 * Shared mobile overlay behavior: focus trap, body scroll lock, and focus return.
 */
export function useOverlayPanel({
  isOpen,
  panelRef,
  triggerRef,
  onClose,
}: UseOverlayPanelOptions) {
  const close = useCallback(() => {
    onClose()
    triggerRef?.current?.focus()
  }, [onClose, triggerRef])

  useFocusTrap(isOpen, panelRef, close)
  useLockBodyScroll(isOpen)

  return { close }
}
