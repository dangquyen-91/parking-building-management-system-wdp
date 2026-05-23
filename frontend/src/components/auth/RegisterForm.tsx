import { motion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStaggerFormMotion } from '../../hooks/useStaggerFormMotion'
import { focusFirstFormError } from '../../utils/focusFirstFormError'
import { requireEmail, requirePassword } from '../../utils/validation'
import { AuthField } from './AuthField'
import { AuthSubmitButton } from './AuthSubmitButton'

const REGISTER_FIELDS = [
  { key: 'fullName', id: 'register-name' },
  { key: 'email', id: 'register-email' },
  { key: 'password', id: 'register-password' },
  { key: 'confirmPassword', id: 'register-confirm' },
] as const

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
  const emailError = requireEmail(values.email)
  if (emailError) errors.email = emailError
  const passwordError = requirePassword(values.password)
  if (passwordError) errors.password = passwordError
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function RegisterForm() {
  const { motionForm, fieldVariants } = useStaggerFormMotion()
  const [values, setValues] = useState<RegisterValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const clearFieldError = (field: keyof RegisterValues) => {
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...REGISTER_FIELDS])
      return
    }

    setStatus('loading')
    window.setTimeout(() => {
      setStatus('success')
    }, 1400)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={fieldVariants} custom={0}>
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

        <motion.div variants={fieldVariants} custom={0.05}>
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

        <motion.div variants={fieldVariants} custom={0.1}>
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

        <motion.div variants={fieldVariants} custom={0.14}>
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

      <div aria-live="polite" aria-atomic="true" className="min-h-[1.25rem]">
        {status === 'success' && (
          <p className="text-xs text-muted">
            Account created locally — wire this form to your registration API when ready.
          </p>
        )}
      </div>

      <AuthSubmitButton
        status={status}
        labels={{
          idle: 'Create account',
          loading: 'Creating account…',
          success: 'Account ready',
        }}
      />

      <p className="text-center text-xs text-faint">
        Already have access?{' '}
        <Link to="/login" className="text-fg hover:text-fg transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
