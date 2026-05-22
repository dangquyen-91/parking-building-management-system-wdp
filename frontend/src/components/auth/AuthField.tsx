import type { InputHTMLAttributes } from 'react'

type AuthFieldProps = {
  id: string
  label: string
  error?: string
  helper?: string
} & InputHTMLAttributes<HTMLInputElement>

export function AuthField({ id, label, error, helper, className = '', ...inputProps }: AuthFieldProps) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-zinc-300 uppercase">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-white placeholder:text-zinc-500',
          'transition-[border-color,box-shadow,transform] duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50',
          'active:scale-[0.995]',
          error ? 'border-rose-500/60' : 'border-zinc-700/80 hover:border-zinc-600',
          className,
        ].join(' ')}
        {...inputProps}
      />
      {helper && !error && (
        <p id={`${id}-helper`} className="text-xs text-zinc-500 leading-relaxed">
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
