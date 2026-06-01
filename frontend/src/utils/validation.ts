const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function requireEmail(value: string): string | undefined {
  if (!value.trim()) return 'Vui lòng nhập email.'
  if (!isValidEmail(value)) return 'Vui lòng nhập địa chỉ email hợp lệ.'
  return undefined
}

export function requirePassword(value: string, minLength = 8): string | undefined {
  if (!value) return 'Vui lòng nhập mật khẩu.'
  if (value.length < minLength) return `Mật khẩu cần ít nhất ${minLength} ký tự.`
  return undefined
}
