import { motion, useReducedMotion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '../../assets/motion/variants'
import { AuthField } from './AuthField'

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues | 'form', string>>

function validate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}
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
  return errors
}

export function LoginForm() {
  const reduceMotion = useReducedMotion()
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [remember, setRemember] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    window.setTimeout(() => {
      setStatus('success')
    }, 1200)
  }

  const motionForm = reduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        animate: 'visible' as const,
        variants: staggerContainer,
      }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <motion.div className="flex flex-col gap-5" {...motionForm}>
        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0}>
          <AuthField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="mira.chen@riverside-tower.vn"
            value={values.email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, email: e.target.value }))
              if (errors.email) setErrors((err) => ({ ...err, email: undefined }))
            }}
            error={errors.email}
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeUp} custom={0.06}>
          <AuthField
            id="login-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={values.password}
            disabled={status === 'loading'}
            onChange={(e) => {
              setValues((v) => ({ ...v, password: e.target.value }))
              if (errors.password) setErrors((err) => ({ ...err, password: undefined }))
            }}
            error={errors.password}
          />
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-900 text-white focus:ring-white/40"
            disabled={status === 'loading'}
          />
          Remember this device
        </label>
        <a
          href="#recover"
          className="text-zinc-400 hover:text-white transition-colors duration-200"
        >
          Forgot password?
        </a>
      </div>

      {errors.form && (
        <p role="alert" className="text-xs text-rose-400">
          {errors.form}
        </p>
      )}

      {status === 'success' && (
        <p role="status" className="text-xs text-gray-300">
          Signed in locally — connect your API endpoint when the backend is ready.
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
        {status === 'loading' ? 'Signing in…' : status === 'success' ? 'Welcome back' : 'Sign in'}
      </button>

      <p className="text-center text-xs text-zinc-500">
        New to the platform?{' '}
        <Link to="/register" className="text-white hover:text-gray-200 transition-colors">
          Create an account
        </Link>
      </p>
    </form>
  )
}
