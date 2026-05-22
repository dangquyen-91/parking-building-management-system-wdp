import { motion, useReducedMotion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { AuthField } from './AuthField'

type RegisterValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterErrors = Partial<Record<keyof RegisterValues | 'form', string>>

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {}
  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.'
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function RegisterForm() {
  const reduceMotion = useReducedMotion()
  const [values, setValues] = useState<RegisterValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    window.setTimeout(() => {
      setStatus('success')
    }, 1400)
  }

  const motionForm = reduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: staggerContainer,
      }

  const clearFieldError = (field: keyof RegisterValues) => {
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0}>
          <AuthField
            id="register-name"
            label="Full name"
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Mira Chen"
            value={values.fullName}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, fullName: e.target.value }))
              clearFieldError('fullName')
            }}
            error={errors.fullName}
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0.05}>
          <AuthField
            id="register-email"
            label="Work email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="mira.chen@riverside-tower.vn"
            value={values.email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }))
              clearFieldError('email')
            }}
            error={errors.email}
            helper="Use your building or property management address."
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0.1}>
          <AuthField
            id="register-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={values.password}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, password: e.target.value }))
              clearFieldError('password')
            }}
            error={errors.password}
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0.14}>
          <AuthField
            id="register-confirm"
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={values.confirmPassword}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, confirmPassword: e.target.value }))
              clearFieldError('confirmPassword')
            }}
            error={errors.confirmPassword}
          />
        </motion.div>
      </motion.div>

      {status === 'success' && (
        <p role="status" className="text-xs text-gray-300">
          Account created locally — wire this form to your registration API when ready.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className={[
          'w-full rounded-full py-3.5 text-sm font-medium transition-[transform,background-color,opacity] duration-200',
          'bg-white text-black hover:bg-gray-100',
          'active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
          status === 'loading' ? 'animate-pulse' : '',
        ].join(' ')}
      >
        {status === 'loading' ? 'Creating account…' : status === 'success' ? 'Account ready' : 'Create account'}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Already have access?{' '}
        <Link to="/login" className="text-white hover:text-gray-200 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
