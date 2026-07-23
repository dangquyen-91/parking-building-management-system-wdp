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

// Vietnamese mobile: 10 digits starting with 0.
const VN_PHONE_PATTERN = /^0\d{9}$/
// Plate (normalized: uppercase, no spaces): 51F-12345, 30E-123.45, ...
const LICENSE_PLATE_PATTERN = /^\d{2}[A-Z]{1,2}-?\d{3,5}(\.\d{2})?$/

export function isValidVNPhone(value: string): boolean {
  return VN_PHONE_PATTERN.test(value.trim())
}

export function isValidLicensePlate(value: string): boolean {
  return LICENSE_PLATE_PATTERN.test(value.toUpperCase().replace(/\s/g, ''))
}

export function requireVNPhone(value: string): string | undefined {
  if (!value.trim()) return 'Vui lòng nhập số điện thoại.'
  if (!isValidVNPhone(value)) return 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).'
  return undefined
}

export function requireLicensePlate(value: string): string | undefined {
  if (!value.trim()) return 'Vui lòng nhập biển số xe.'
  if (!isValidLicensePlate(value)) return 'Biển số xe không hợp lệ (ví dụ: 51F-12345).'
  return undefined
}
