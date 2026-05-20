import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms */
  delay?: number
  /** How much of the element must be visible (0–1) */
  threshold?: number
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties

  return (
    <div
      ref={ref}
      className={['scroll-reveal', visible && 'scroll-reveal--visible', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}
