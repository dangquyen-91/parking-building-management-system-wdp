import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStaggerFormMotion } from '../../hooks/useStaggerFormMotion'
import { authApi, getDefaultRouteForRole } from '../../services/authApi'
import { focusFirstFormError } from '../../utils/focusFirstFormError'
import { requireEmail, requirePassword } from '../../utils/validation'
import { AuthField } from './AuthField'
import { AuthSubmitButton } from './AuthSubmitButton'

const LOGIN_FIELDS = [
  { key: 'email', id: 'login-email' },
  { key: 'password', id: 'login-password' },
] as const

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues | 'form', string>>

function validate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}
  const emailError = requireEmail(values.email)
  if (emailError) errors.email = emailError
  const passwordError = requirePassword(values.password)
  if (passwordError) errors.password = passwordError
  return errors
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { motionForm, fieldVariants } = useStaggerFormMotion()
  const initialEmail = useMemo(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email
    return stateEmail || ''
  }, [location.state])
  const [values, setValues] = useState<LoginValues>({ email: initialEmail, password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const clearError = (field: keyof LoginValues) => {
    if (errors[field] || errors.form) {
      setErrors((err) => ({ ...err, [field]: undefined, form: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, [...LOGIN_FIELDS])
      return
    }

    try {
      setStatus('loading')
      const session = await authApi.login({
        email: values.email,
        password: values.password,
      })
      setStatus('success')
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || getDefaultRouteForRole(session.user.role), { replace: true })
    } catch (error) {
      setStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={fieldVariants} custom={0}>
          <AuthField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Nhập email"
            value={values.email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }))
              clearError('email')
            }}
            error={errors.email}
          />
        </motion.div>

        <motion.div variants={fieldVariants} custom={0.06}>
          <AuthField
            id="login-password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={values.password}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, password: e.target.value }))
              clearError('password')
            }}
            error={errors.password}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={status === 'loading'}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                className="rounded-md p-1 text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            }
          />
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex items-center gap-2 text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-theme-strong auth-input text-fg outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
            disabled={status === 'loading'}
          />
          Ghi nhớ thiết bị này
        </label>
        <Link
          to="/forgot-password"
          state={{ email: values.email.trim() }}
          className="text-muted hover:text-fg transition-colors duration-200"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-[1.25rem]">
        {errors.form && (
          <p role="alert" className="text-xs text-rose-400">
            {errors.form}
          </p>
        )}
        {status === 'success' && (
          <p className="text-xs text-muted">
            Đăng nhập thành công. Đang chuyển hướng...
          </p>
        )}
      </div>

      <AuthSubmitButton
        status={status}
        labels={{
          idle: 'Đăng nhập',
          loading: 'Đang đăng nhập...',
          success: 'Chào mừng trở lại',
        }}
      />

      <p className="text-center text-xs text-faint">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-fg hover:text-fg transition-colors">
          Tạo tài khoản
        </Link>
      </p>

      <p className="text-center text-xs text-faint">
        Chưa xác thực email?{' '}
        <Link to="/verify-email" state={{ email: values.email.trim() }} className="text-fg transition-colors hover:text-fg">
          Nhập mã OTP
        </Link>
      </p>
    </form>
  )
}

