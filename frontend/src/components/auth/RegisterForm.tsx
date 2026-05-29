import { motion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStaggerFormMotion } from '../../hooks/useStaggerFormMotion'
import { authApi } from '../../services/authApi'
import { focusFirstFormError } from '../../utils/focusFirstFormError'
import { requireEmail, requirePassword } from '../../utils/validation'
import { AuthField } from './AuthField'
import { AuthSubmitButton } from './AuthSubmitButton'

const REGISTER_FIELDS = [
  { key: 'fullName', id: 'register-name' },
  { key: 'email', id: 'register-email' },
  { key: 'phone', id: 'register-phone' },
  { key: 'password', id: 'register-password' },
  { key: 'confirmPassword', id: 'register-confirm' },
] as const

type RegisterValues = {
  fullName: string
  email: string
  phone: string
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
  if (values.phone.trim() && values.phone.trim().length < 8) {
    errors.phone = 'Enter a valid phone number.'
  }
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
  const navigate = useNavigate()
  const { motionForm, fieldVariants } = useStaggerFormMotion()
  const [values, setValues] = useState<RegisterValues>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const clearFieldError = (field: keyof RegisterValues) => {
    if (errors[field] || errors.form) {
      setErrors((err) => ({ ...err, [field]: undefined, form: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...REGISTER_FIELDS])
      return
    }

    try {
      setStatus('loading')
      await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        password: values.password,
      })
      setStatus('success')
      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 700)
    } catch (error) {
      setStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to create account. Please try again.',
      })
    }
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
            placeholder="Enter your full name"
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
            placeholder="Enter your email"
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
            id="register-phone"
            label="Phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={values.phone}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, phone: e.target.value }))
              clearFieldError('phone')
            }}
            error={errors.phone}
            helper="Optional, saved to your user profile."
          />
        </motion.div>

        <motion.div variants={fieldVariants} custom={0.15}>
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

        <motion.div variants={fieldVariants} custom={0.2}>
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
        {errors.form && (
          <p role="alert" className="text-xs text-rose-400">
            {errors.form}
          </p>
        )}
        {status === 'success' && (
          <p className="text-xs text-muted">
            Account created. Redirecting to sign in...
          </p>
        )}
      </div>

      <AuthSubmitButton
        status={status}
        labels={{
          idle: 'Create account',
          loading: 'Creating account...',
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
