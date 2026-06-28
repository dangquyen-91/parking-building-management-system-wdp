import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ResidentSubscriptionTopNav } from '../../components/subscription'
import { ProfileVehiclesSection } from '../../components/profile/ProfileVehiclesSection'
import { getStoredAuthUser, type AuthUser } from '../../services/authApi'
import { userApi } from '../../services/userApi'

type ProfileFormState = {
  fullName: string
  phone: string
}

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ROLE_LABELS: Record<AuthUser['role'], string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
  user: 'Người dùng',
}

export function ProfilePage() {
  const [user, setUser] = useState<AuthUser | undefined>(() => getStoredAuthUser())
  const [form, setForm] = useState<ProfileFormState>({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const initials = useMemo(() => {
    const source = user?.fullName?.trim() || user?.email || 'U'

    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }, [user])

  useEffect(() => {
    let isActive = true

    userApi
      .getMe()
      .then((response) => {
        if (!isActive) return

        setUser(response.user)
        setForm({
          fullName: response.user.fullName ?? '',
          phone: response.user.phone ?? '',
        })
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await userApi.updateMe({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
      })

      setUser(response.user)
      setForm({
        fullName: response.user.fullName ?? '',
        phone: response.user.phone ?? '',
      })
      setMessage('Đã cập nhật thông tin hồ sơ.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại.')
      return
    }

    setIsChangingPassword(true)

    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordMessage('Đổi mật khẩu thành công.')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Không thể đổi mật khẩu.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <ResidentSubscriptionTopNav activeItem="profile" />

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-8 pt-24 md:px-8 md:pb-10 lg:px-10">
        <div className="mb-6 overflow-hidden rounded-lg border border-emerald-500/20 bg-badge shadow-xl shadow-emerald-950/5">
          <div className="grid gap-5 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-violet-500/10 p-5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-500 to-violet-500 text-2xl font-black text-white shadow-lg shadow-sky-500/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                Tài khoản người dùng
              </p>
              <h1 className="mt-2 truncate text-3xl font-black tracking-tight text-fg md:text-4xl">
                {user?.fullName || 'Hồ sơ của tôi'}
              </h1>
              <p className="mt-2 truncate text-sm text-muted">{user?.email}</p>
            </div>
            <Link
              to="/my-subscriptions"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 px-4 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-500/20 dark:text-sky-100"
            >
              Gói của tôi
            </Link>
          </div>

          <div className="grid gap-px border-t border-theme bg-[color:var(--border)] sm:grid-cols-3">
            <ProfileStat label="Vai trò" value={user ? ROLE_LABELS[user.role] : '-'} tone="emerald" />
            <ProfileStat label="Trạng thái" value={user?.isActive ? 'Đang hoạt động' : 'Bị khóa'} tone="sky" />
            <ProfileStat label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} tone="violet" />
          </div>
        </div>

        {message && <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-100">{message}</div>}
        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        <section className="liquid-glass-card rounded-lg p-5 md:p-7">
          <div className="mb-6 border-l-4 border-emerald-500 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
              Thông tin cá nhân
            </p>
            <h2 className="mt-1 text-xl font-bold text-fg">Cập nhật hồ sơ</h2>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải thông tin hồ sơ...</div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-fg">Họ và tên</span>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  required
                  minLength={2}
                  maxLength={100}
                  className="h-12 rounded-lg border border-theme bg-page px-4 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-fg">Email</span>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="h-12 rounded-lg border border-theme bg-badge px-4 text-sm text-muted outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-fg">Số điện thoại</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  pattern="[0-9+\-\s]{7,15}"
                  className="h-12 rounded-lg border border-theme bg-page px-4 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Nhập số điện thoại"
                />
              </label>

              <div className="flex flex-col gap-3 border-t border-theme pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">Email đăng nhập hiện không thể thay đổi tại đây.</p>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-sky-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </section>

        <ProfileVehiclesSection
          vehicles={user?.vehicles ?? []}
          isLoading={isLoading}
          onUserChange={setUser}
        />

        <section className="liquid-glass-card mt-6 rounded-lg p-5 md:p-7">
          <div className="mb-6 border-l-4 border-violet-500 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">
              Bảo mật tài khoản
            </p>
            <h2 className="mt-1 text-xl font-bold text-fg">Đổi mật khẩu</h2>
            <p className="mt-2 text-sm text-muted">
              Sử dụng mật khẩu mạnh và không dùng lại mật khẩu của các tài khoản khác.
            </p>
          </div>

          {passwordMessage && (
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-100">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
              {passwordError}
            </div>
          )}

          <form className="grid gap-5" onSubmit={handlePasswordSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-fg">Mật khẩu hiện tại</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => {
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                  setPasswordError(null)
                }}
                required
                autoComplete="current-password"
                className="h-12 rounded-lg border border-theme bg-page px-4 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-fg">Mật khẩu mới</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => {
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    setPasswordError(null)
                  }}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className="h-12 rounded-lg border border-theme bg-page px-4 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-fg">Xác nhận mật khẩu mới</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => {
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    setPasswordError(null)
                  }}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className="h-12 rounded-lg border border-theme bg-page px-4 text-sm text-fg outline-none transition-colors placeholder:text-subtle focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-theme pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">Mật khẩu mới phải có từ 8 đến 128 ký tự.</p>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

function ProfileStat({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'sky' | 'violet' }) {
  const toneClass = {
    emerald: 'border-t-emerald-500',
    sky: 'border-t-sky-500',
    violet: 'border-t-violet-500',
  }[tone]

  return (
    <div className={`border-t-2 bg-page p-4 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</p>
      <p className="mt-1.5 truncate text-sm font-bold text-fg">{value}</p>
    </div>
  )
}
