import type { InputHTMLAttributes, ReactNode } from 'react'

type AuthFieldProps = {
  id: string
  label: string
  error?: string
  helper?: string
  trailingAction?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export function AuthField({ id, label, error, helper, trailingAction, className = '', ...inputProps }: AuthFieldProps) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'auth-input w-full rounded-xl border px-4 py-3 text-sm text-fg placeholder:text-faint',
            'transition-[border-color,box-shadow,transform] duration-200',
            'outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]',
            'active:scale-[0.995]',
            trailingAction ? 'pr-12' : '',
            error ? 'border-rose-500/60' : '',
            className,
          ].join(' ')}
          {...inputProps}
        />
        {trailingAction && <div className="absolute inset-y-0 right-3 flex items-center">{trailingAction}</div>}
      </div>
      {helper && !error && (
        <p id={`${id}-helper`} className="text-xs text-faint leading-relaxed">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-400 leading-relaxed">
          {error}
        </p>
      )}
    </div>
  )
}
