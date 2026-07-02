import { motion } from 'framer-motion'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStaggerFormMotion } from '../../hooks/useStaggerFormMotion'
import { authApi } from '../../services/authApi'
import { focusFirstFormError } from '../../utils/focusFirstFormError'
import { requireEmail, requirePassword } from '../../utils/validation'
import { AuthField } from './AuthField'
import { AuthSubmitButton } from './AuthSubmitButton'

const EMAIL_FIELDS = [{ key: 'email', id: 'forgot-email' }] as const
const OTP_FIELDS = [{ key: 'otp', id: 'forgot-otp' }] as const
const PASSWORD_FIELDS = [
  { key: 'newPassword', id: 'forgot-new-password' },
  { key: 'confirmPassword', id: 'forgot-confirm-password' },
] as const

type ForgotPasswordStep = 'request' | 'verify' | 'password'

type ForgotPasswordValues = {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

type ForgotPasswordErrors = Partial<Record<keyof ForgotPasswordValues | 'form', string>>

function validateRequest(values: ForgotPasswordValues): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {}
  const emailError = requireEmail(values.email)
  if (emailError) errors.email = emailError
  return errors
}

function validateOtp(values: ForgotPasswordValues): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {}

  if (!values.otp.trim()) {
    errors.otp = 'Vui lòng nhập mã OTP.'
  } else if (!/^\d{6}$/.test(values.otp.trim())) {
    errors.otp = 'Mã OTP gồm 6 chữ số.'
  }

  return errors
}

function validatePassword(values: ForgotPasswordValues): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {}
  const passwordError = requirePassword(values.newPassword)
  if (passwordError) errors.newPassword = passwordError

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới.'
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại chưa khớp.'
  }

  return errors
}

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { motionForm, fieldVariants } = useStaggerFormMotion()
  const initialEmail = useMemo(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email
    const queryEmail = new URLSearchParams(location.search).get('email')
    return stateEmail || queryEmail || ''
  }, [location.search, location.state])

  const [step, setStep] = useState<ForgotPasswordStep>('request')
  const [values, setValues] = useState<ForgotPasswordValues>({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const clearFieldError = (field: keyof ForgotPasswordValues) => {
    if (errors[field] || errors.form) {
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
    }
  }

  const handleRequestOtp = async () => {
    const nextErrors = validateRequest(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...EMAIL_FIELDS])
      return
    }

    try {
      setStatus('loading')
      const responseMessage = await authApi.forgotPassword({ email: values.email.trim() })
      setMessage(responseMessage || 'Nếu email tồn tại, mã OTP sẽ được gửi tới hộp thư của bạn.')
      setStep('verify')
      setStatus('idle')
    } catch (error) {
      setStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể gửi mã OTP. Vui lòng thử lại.',
      })
    }
  }

  const handleVerifyOtp = () => {
    const nextErrors = validateOtp(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...OTP_FIELDS])
      return
    }

    setMessage('Mã OTP đã được nhập. Vui lòng tạo mật khẩu mới.')
    setStep('password')
  }

  const handleResetPassword = async () => {
    const nextErrors = validatePassword(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...PASSWORD_FIELDS])
      return
    }

    try {
      setStatus('loading')
      const responseMessage = await authApi.resetPassword({
        email: values.email.trim(),
        otp: values.otp.trim(),
        newPassword: values.newPassword,
      })
      setMessage(responseMessage || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.')
      setStatus('success')
      window.setTimeout(() => {
        navigate('/login', { replace: true, state: { email: values.email.trim() } })
      }, 900)
    } catch (error) {
      setStatus('idle')
      setStep('verify')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu. Vui lòng thử lại.',
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 'request') {
      await handleRequestOtp()
      return
    }

    if (step === 'verify') {
      handleVerifyOtp()
      return
    }

    await handleResetPassword()
  }

  const submitLabels = {
    request: {
      idle: 'Gửi mã OTP',
      loading: 'Đang gửi mã...',
      success: 'Đã gửi mã',
    },
    verify: {
      idle: 'Xác nhận mã OTP',
      loading: 'Đang kiểm tra...',
      success: 'Mã đã khớp',
    },
    password: {
      idle: 'Đặt lại mật khẩu',
      loading: 'Đang đặt lại...',
      success: 'Đã đổi mật khẩu',
    },
  }[step]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={fieldVariants} custom={0}>
          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Nhập email đã đăng ký"
            value={values.email}
            disabled={status === 'loading' || step !== 'request'}
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }))
              clearFieldError('email')
            }}
            error={errors.email}
          />
        </motion.div>

        {(step === 'verify' || step === 'password') && (
          <motion.div variants={fieldVariants} custom={0.06}>
            <AuthField
              id="forgot-otp"
              label="Mã OTP"
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Nhập 6 chữ số"
              value={values.otp}
              disabled={status === 'loading' || step === 'password'}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  otp: event.target.value.replace(/\D/g, '').slice(0, 6),
                }))
                clearFieldError('otp')
              }}
              error={errors.otp}
              helper={step === 'verify' ? 'Xác nhận mã trước khi tạo mật khẩu mới.' : 'Mã OTP đã được xác nhận trên giao diện.'}
              className="text-center text-lg font-black tracking-[0.35em]"
            />
          </motion.div>
        )}

        {step === 'password' && (
          <>
            <motion.div variants={fieldVariants} custom={0.12}>
              <AuthField
                id="forgot-new-password"
                label="Mật khẩu mới"
                type="password"
                name="newPassword"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                value={values.newPassword}
                disabled={status === 'loading'}
                onChange={(event) => {
                  setValues((current) => ({ ...current, newPassword: event.target.value }))
                  clearFieldError('newPassword')
                }}
                error={errors.newPassword}
              />
            </motion.div>

            <motion.div variants={fieldVariants} custom={0.18}>
              <AuthField
                id="forgot-confirm-password"
                label="Nhập lại mật khẩu"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={values.confirmPassword}
                disabled={status === 'loading'}
                onChange={(event) => {
                  setValues((current) => ({ ...current, confirmPassword: event.target.value }))
                  clearFieldError('confirmPassword')
                }}
                error={errors.confirmPassword}
              />
            </motion.div>
          </>
        )}
      </motion.div>

      <div aria-live="polite" aria-atomic="true" className="min-h-[1.25rem]">
        {errors.form && (
          <p role="alert" className="text-xs text-rose-400">
            {errors.form}
          </p>
        )}
        {message && <p className="text-xs text-muted">{message}</p>}
      </div>

      <AuthSubmitButton status={status} labels={submitLabels} />

      {step !== 'request' && status !== 'success' && (
        <button
          type="button"
          onClick={() => void handleRequestOtp()}
          disabled={status === 'loading'}
          className="rounded-full border border-theme px-4 py-3 text-sm font-semibold text-fg transition hover:bg-badge disabled:pointer-events-none disabled:opacity-60"
        >
          Gửi lại mã OTP
        </button>
      )}

      <p className="text-center text-xs text-faint">
        Nhớ mật khẩu rồi?{' '}
        <Link to="/login" state={{ email: values.email.trim() }} className="text-fg transition-colors hover:text-fg">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
