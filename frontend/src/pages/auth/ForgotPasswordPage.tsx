import { Link } from 'react-router-dom'
import { AuthLayout, ForgotPasswordForm } from '../../components/auth'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận mã OTP, sau đó tạo mật khẩu mới cho tài khoản của bạn."
      panelAlign="center"
      panelEyebrow="Account recovery"
      panelHeading="Lấy lại quyền truy cập."
      panelBody="Mã OTP chỉ có hiệu lực trong 10 phút. Sau khi đổi mật khẩu, bạn cần đăng nhập lại để tiếp tục sử dụng hệ thống."
      footer={
        <>
          Đã có mã xác thực đăng ký?{' '}
          <Link to="/verify-email" className="text-fg hover:text-fg transition-colors">
            Xác thực email
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
