import { motion } from 'framer-motion'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStaggerFormMotion } from '../../hooks/useStaggerFormMotion'
import { authApi } from '../../services/authApi'
import { focusFirstFormError } from '../../utils/focusFirstFormError'
import { requireEmail } from '../../utils/validation'
import { AuthField } from './AuthField'
import { AuthSubmitButton } from './AuthSubmitButton'

const VERIFY_FIELDS = [
  { key: 'email', id: 'verify-email' },
  { key: 'otp', id: 'verify-otp' },
] as const

type VerifyValues = {
  email: string
  otp: string
}

type VerifyErrors = Partial<Record<keyof VerifyValues | 'form', string>>

function validate(values: VerifyValues): VerifyErrors {
  const errors: VerifyErrors = {}
  const emailError = requireEmail(values.email)
  if (emailError) errors.email = emailError

  if (!values.otp.trim()) {
    errors.otp = 'Vui lòng nhập mã OTP.'
  } else if (!/^\d{6}$/.test(values.otp.trim())) {
    errors.otp = 'Mã OTP gồm 6 chữ số.'
  }

  return errors
}

export function VerifyEmailForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { motionForm, fieldVariants } = useStaggerFormMotion()
  const initialEmail = useMemo(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email
    const queryEmail = new URLSearchParams(location.search).get('email')
    return stateEmail || queryEmail || ''
  }, [location.search, location.state])

  const [values, setValues] = useState<VerifyValues>({ email: initialEmail, otp: '' })
  const [errors, setErrors] = useState<VerifyErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  const clearFieldError = (field: keyof VerifyValues) => {
    if (errors[field] || errors.form) {
      setErrors((err) => ({ ...err, [field]: undefined, form: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...VERIFY_FIELDS])
      return
    }

    try {
      setStatus('loading')
      await authApi.verifyEmail({
        email: values.email.trim(),
        otp: values.otp.trim(),
      })
      setStatus('success')
      window.setTimeout(() => {
        navigate('/login', { replace: true, state: { email: values.email.trim() } })
      }, 800)
    } catch (error) {
      setStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể xác thực email. Vui lòng thử lại.',
      })
    }
  }

  const handleResend = async () => {
    const emailError = requireEmail(values.email)
    if (emailError) {
      setErrors((err) => ({ ...err, email: emailError }))
      focusFirstFormError({ email: emailError }, [...VERIFY_FIELDS])
      return
    }

    try {
      setResendStatus('loading')
      const message = await authApi.resendVerification({ email: values.email.trim() })
      setResendMessage(message || 'Mã OTP mới đã được gửi.')
      setResendStatus('success')
    } catch (error) {
      setResendStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể gửi lại mã OTP. Vui lòng thử lại.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={fieldVariants} custom={0}>
          <AuthField
            id="verify-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Nhập email đã đăng ký"
            value={values.email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }))
              clearFieldError('email')
              setResendMessage('')
              setResendStatus('idle')
            }}
            error={errors.email}
          />
        </motion.div>

        <motion.div variants={fieldVariants} custom={0.06}>
          <AuthField
            id="verify-otp"
            label="Mã OTP"
            type="text"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Nhập 6 chữ số"
            value={values.otp}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))
              clearFieldError('otp')
            }}
            error={errors.otp}
            helper="Mã OTP có hiệu lực trong 10 phút."
            className="text-center text-lg font-black tracking-[0.35em]"
          />
        </motion.div>
      </motion.div>

      <div aria-live="polite" aria-atomic="true" className="min-h-[1.25rem]">
        {errors.form && (
          <p role="alert" className="text-xs text-rose-400">
            {errors.form}
          </p>
        )}
        {resendMessage && <p className="text-xs text-muted">{resendMessage}</p>}
        {status === 'success' && (
          <p className="text-xs text-muted">
            Xác thực thành công. Đang chuyển đến đăng nhập...
          </p>
        )}
      </div>

      <AuthSubmitButton
        status={status}
        labels={{
          idle: 'Xác thực email',
          loading: 'Đang xác thực...',
          success: 'Email đã xác thực',
        }}
      />

      <button
        type="button"
        onClick={handleResend}
        disabled={resendStatus === 'loading' || status === 'loading' || status === 'success'}
        className="rounded-full border border-theme px-4 py-3 text-sm font-semibold text-fg transition hover:bg-badge disabled:pointer-events-none disabled:opacity-60"
      >
        {resendStatus === 'loading' ? 'Đang gửi lại mã...' : 'Gửi lại mã OTP'}
      </button>

      <p className="text-center text-xs text-faint">
        Đã xác thực rồi?{' '}
        <Link to="/login" className="text-fg transition-colors hover:text-fg">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
