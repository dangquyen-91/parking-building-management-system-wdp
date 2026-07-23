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
    errors.fullName = 'Vui lòng nhập họ và tên.'
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Vui lòng nhập họ và tên đầy đủ.'
  }
  const emailError = requireEmail(values.email)
  if (emailError) errors.email = emailError
  if (values.phone.trim() && values.phone.trim().length < 8) {
    errors.phone = 'Vui lòng nhập số điện thoại hợp lệ.'
  }
  const passwordError = requirePassword(values.password)
  if (passwordError) errors.password = passwordError
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
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
        navigate('/verify-email', { replace: true, state: { email: values.email.trim() } })
      }, 700)
    } catch (error) {
      setStatus('idle')
      setErrors({
        form: error instanceof Error ? error.message : 'Không thể tạo tài khoản. Vui lòng thử lại.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={fieldVariants} custom={0}>
          <AuthField
            id="register-name"
            label="Họ và tên"
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Nhập họ và tên"
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
            label="Email "
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Nhập email"
            value={values.email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }))
              clearFieldError('email')
            }}
            error={errors.email}
            helper="Sử dụng email của tòa nhà hoặc đơn vị quản lý."
          />
        </motion.div>

        <motion.div variants={fieldVariants} custom={0.1}>
          <AuthField
            id="register-phone"
            label="Số điện thoại"
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="Nhập số điện thoại"
            value={values.phone}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, phone: e.target.value }))
              clearFieldError('phone')
            }}
            error={errors.phone}
            helper="Không bắt buộc, dùng để lưu vào hồ sơ người dùng."
          />
        </motion.div>

        <motion.div variants={fieldVariants} custom={0.15}>
          <AuthField
            id="register-password"
            label="Mật khẩu"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
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
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
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
            Tạo tài khoản thành công. Đang chuyển đến xác thực email...
          </p>
        )}
      </div>

      <AuthSubmitButton
        status={status}
        labels={{
          idle: 'Tạo tài khoản',
          loading: 'Đang tạo tài khoản...',
          success: 'Kiểm tra email của bạn',
        }}
      />

      <p className="text-center text-xs text-faint">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-fg hover:text-fg transition-colors">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
