import { Link } from 'react-router-dom'

type BookingEmptyStateProps = {
  title: string
  description: string
  link: string
  action: string
}

export function BookingEmptyState({ title, description, link, action }: BookingEmptyStateProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-9 text-center shadow-[0_24px_60px_-35px_rgba(79,70,229,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-2xl font-black text-white shadow-lg shadow-violet-500/25">
        P
      </div>
      <h2 className="mt-5 text-xl font-bold text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      <Link
        to={link}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
      >
        {action}
      </Link>
    </section>
  )
}
