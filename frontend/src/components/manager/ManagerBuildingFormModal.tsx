import { useEffect, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../common'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import type { BuildingPayload } from '../../services/managerBuildingsApi'

type ManagerBuildingFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: BuildingPayload
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: BuildingPayload) => void
}

export function ManagerBuildingFormModal({
  open,
  mode,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerBuildingFormModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    setName(initialValues?.name ?? '')
    setAddress(initialValues?.address ?? '')
    setDescription(initialValues?.description ?? '')
  }, [open, initialValues])

  if (!open) return null

  const isValid = name.trim().length > 0 && address.trim().length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    onSubmit({ name: name.trim(), address: address.trim(), description: description.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label="Close building form"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-theme bg-page p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-subtle">Manager // Buildings</p>
            <h2 className="mt-2 text-xl font-semibold text-fg">
              {mode === 'create' ? 'Create building' : 'Edit building'}
            </h2>
            <p className="mt-2 text-xs text-muted">Enter the building details.</p>
          </div>
          <button
            type="button"
            className="text-xs text-subtle hover:text-fg"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-xs text-subtle">
            Building name
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Building A"
              required
            />
          </label>

          <label className="grid gap-2 text-xs text-subtle">
            Address
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Main Street"
              required
            />
          </label>

          <label className="grid gap-2 text-xs text-subtle">
            Description (optional)
            <textarea
              className="min-h-[96px] rounded-lg border border-theme bg-page px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="10-story office building"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-theme bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="h-10 rounded-lg border border-theme px-4 text-sm text-subtle hover:text-fg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create building' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
