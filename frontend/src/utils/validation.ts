const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function requireEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email is required.'
  if (!isValidEmail(value)) return 'Enter a valid email address.'
  return undefined
}

export function requirePassword(value: string, minLength = 8): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < minLength) return `Use at least ${minLength} characters.`
  return undefined
}
