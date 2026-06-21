import { useEffect, useState } from 'react'
import type { BuildingPayload } from '../../../services/managerBuildingsApi'
import { AdminField, AdminModal, AdminModalActions, adminInputClass } from '../common/AdminFormPrimitives'

export function AdminBuildingFormModal({ open, mode, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; initialValues?: BuildingPayload; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: BuildingPayload) => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setName(initialValues?.name ?? ''); setAddress(initialValues?.address ?? ''); setDescription(initialValues?.description ?? '') } }, [open, initialValues])
  if (!open) return null

  return (
    <AdminModal title={mode === 'create' ? 'Tạo tòa nhà' : 'Chỉnh sửa tòa nhà'} eyebrow="Admin // Tòa nhà" error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ name: name.trim(), address: address.trim(), description: description.trim() || undefined }) }}>
        <AdminField label="Tên tòa nhà"><input className={adminInputClass} value={name} onChange={(event) => setName(event.target.value)} required /></AdminField>
        <AdminField label="Địa chỉ"><input className={adminInputClass} value={address} onChange={(event) => setAddress(event.target.value)} required /></AdminField>
        <AdminField label="Mô tả"><textarea className="min-h-24 rounded-xl border border-theme bg-page p-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={description} onChange={(event) => setDescription(event.target.value)} /></AdminField>
        <AdminModalActions disabled={!name.trim() || !address.trim() || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}
