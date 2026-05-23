import { useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer } from '../assets/motion/variants'

export function useStaggerFormMotion() {
  const reduceMotion = useReducedMotion()

  return {
    reduceMotion,
    motionForm: reduceMotion
      ? {}
      : {
          initial: 'hidden' as const,
          animate: 'visible' as const,
          variants: staggerContainer,
        },
    fieldVariants: reduceMotion ? undefined : fadeUp,
  }
}
