import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/authApi'

export function LogoutButton() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  async function handleLogout() {
    setStatus('loading')
    setError('')

    try {
      await authApi.logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng xuất thất bại')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={status === 'loading'}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-subtle hover:text-fg hover:bg-ghost transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 7l5 5m0 0l-5 5m5-5H9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {status === 'loading' ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
      {error && <p className="px-3 text-[11px] text-rose-300">{error}</p>}
    </div>
  )
}

