import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { AuthBrand } from './AuthBrand'

const DEFAULT_PANEL_IMAGE = '/hello.png'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  panelEyebrow: string
  panelHeading: string
  panelBody: string
  /** Right-panel background image (path under public/) */
  panelImage?: string
  panelStats?: { value: string; label: string }[]
  /** Vertical placement of overlay copy on the image panel */
  panelAlign?: 'center' | 'end'
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  panelEyebrow,
  panelHeading,
  panelBody,
  panelImage = DEFAULT_PANEL_IMAGE,
  panelStats = [],
  panelAlign = 'end',
}: AuthLayoutProps) {
  const reduceMotion = useReducedMotion()

  const motionRoot = reduceMotion
    ? { className: 'contents' }
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: staggerContainer,
      }

  return (
    <div className="min-h-[100dvh] bg-[#121212] text-white font-['Outfit',system-ui,sans-serif]">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
          <div className="mb-10">
            <AuthBrand />
          </div>

          <motion.div className="flex flex-1 flex-col justify-center max-w-md w-full mx-auto lg:mx-0" {...motionRoot}>
            <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0}>
              <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-3 select-none">
                Secure access
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-none text-white mb-3">
                {title}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-[42ch] mb-8">{subtitle}</p>
            </motion.div>

            <motion.div
              className="liquid-glass-card rounded-[2rem] p-8 md:p-10"
              variants={reduceMotion ? undefined : fadeUp}
              custom={0.08}
            >
              {children}
            </motion.div>

            <motion.div
              className="mt-8 text-sm text-zinc-500"
              variants={reduceMotion ? undefined : fadeUp}
              custom={0.16}
            >
              {footer}
            </motion.div>
          </motion.div>

          <p className="mt-auto pt-10 text-[11px] text-zinc-600">
            <Link to="/" className="hover:text-zinc-400 transition-colors">
              Back to site
            </Link>
          </p>
        </div>

        <aside
          className={[
            'relative hidden lg:flex flex-col overflow-hidden border-l border-white/5',
            panelAlign === 'center' ? 'justify-center' : 'justify-end',
          ].join(' ')}
          aria-hidden="true"
        >
          <img
            src={panelImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1200}
            height={1600}
            decoding="async"
            draggable={false}
          />
          <div
            className={[
              'absolute inset-0',
              panelAlign === 'center'
                ? 'bg-gradient-to-r from-[#121212]/90 via-[#121212]/50 to-[#121212]/30'
                : 'bg-gradient-to-t from-[#121212] via-[#121212]/75 to-[#121212]/20',
            ].join(' ')}
          />

          <div
            className={[
              'relative z-10 p-14 max-w-lg',
              panelAlign === 'center' ? 'py-16' : 'pb-16',
            ].join(' ')}
          >
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-4">{panelEyebrow}</p>
            <h2 className="text-5xl font-semibold tracking-tighter leading-[1.02] mb-4">{panelHeading}</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-[38ch]">{panelBody}</p>

            {panelStats.length > 0 && (
              <ul className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 mt-10">
                {panelStats.map(({ value, label }) => (
                  <li key={label}>
                    <p className="text-2xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
                    <p className="text-xs text-zinc-500 mt-1">{label}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
