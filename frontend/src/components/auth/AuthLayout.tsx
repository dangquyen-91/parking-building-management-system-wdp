import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { ThemeToggle } from '../common/ThemeToggle'
import { AuthBrand } from './AuthBrand'

const DEFAULT_PANEL_IMAGE = '/auth-building-campus.png'

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
    <div className="min-h-[100dvh] bg-page text-fg font-['Outfit',system-ui,sans-serif]">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
          <div className="mb-10 flex items-center justify-between gap-4">
            <AuthBrand />
            <ThemeToggle />
          </div>

          <motion.div className="flex flex-1 flex-col justify-center max-w-md w-full mx-auto lg:mx-0" {...motionRoot}>
            <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0}>
              <p className="text-[10px] tracking-[0.2em] text-subtle uppercase mb-3 select-none">
                Secure access
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter leading-none text-fg mb-3">
                {title}
              </h1>
              <p className="text-sm text-muted leading-relaxed max-w-[42ch] mb-8">{subtitle}</p>
            </motion.div>

            <motion.div
              className="liquid-glass-card rounded-[2rem] p-8 md:p-10"
              variants={reduceMotion ? undefined : fadeUp}
              custom={0.08}
            >
              {children}
            </motion.div>

            <motion.div
              className="mt-8 text-sm text-faint"
              variants={reduceMotion ? undefined : fadeUp}
              custom={0.16}
            >
              {footer}
            </motion.div>
          </motion.div>

          <p className="mt-auto pt-10 text-[11px] text-faint">
            <Link to="/" className="hover:text-muted transition-colors">
              Back to site
            </Link>
          </p>
        </div>

        <aside
          className={[
            'relative hidden lg:flex flex-col overflow-hidden border-l border-theme',
            panelAlign === 'center' ? 'justify-center' : 'justify-end',
          ].join(' ')}
          aria-hidden="true"
        >
          <img
            src={panelImage}
            alt=""
            className="auth-panel-image absolute inset-0 h-full w-full object-cover object-center"
            width={1200}
            height={1600}
            decoding="async"
            draggable={false}
          />
          <div
            className={[
              'absolute inset-0',
              panelAlign === 'center' ? 'auth-panel-overlay-center' : 'auth-panel-overlay',
            ].join(' ')}
          />

          <div
            className={[
              'relative z-10 p-14 max-w-lg',
              panelAlign === 'center' ? 'py-16' : 'pb-16',
            ].join(' ')}
          >
            <p className="text-[10px] tracking-[0.2em] text-auth-subtle uppercase mb-4">{panelEyebrow}</p>
            <h2 className="text-5xl font-semibold tracking-tighter leading-[1.02] text-auth-fg mb-4">{panelHeading}</h2>
            <p className="text-sm text-auth-muted leading-relaxed max-w-[38ch]">{panelBody}</p>

            {panelStats.length > 0 && (
              <ul className="grid grid-cols-2 gap-6 border-t border-auth-panel pt-8 mt-10">
                {panelStats.map(({ value, label }) => (
                  <li key={label}>
                    <p className="text-2xl font-semibold tracking-tight text-auth-fg tabular-nums">{value}</p>
                    <p className="text-xs text-auth-faint mt-1">{label}</p>
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
