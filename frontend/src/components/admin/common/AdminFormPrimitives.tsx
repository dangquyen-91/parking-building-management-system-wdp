import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Label } from '../../ui/label'
import { Alert, AlertDescription } from '../../ui/alert'

export const adminInputClass =
  'border-input bg-transparent h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

export function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return <Label className="grid gap-2 text-xs text-muted-foreground">{label}{children}</Label>
}

export function AdminModal({
  eyebrow,
  title,
  error,
  onClose,
  children,
}: {
  eyebrow: string
  title: string
  error?: string | null
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="pr-10">
          <DialogDescription className="text-[10px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</DialogDescription>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose} aria-label="Đóng"><X /></Button>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function AdminModalActions({ disabled, loading, onClose }: { disabled: boolean; loading: boolean; onClose: () => void }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
      <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
      <Button disabled={disabled}>
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </div>
  )
}
