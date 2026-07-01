import { Link } from 'react-router-dom'
import { AuthLayout, VerifyEmailForm } from '../../components/auth'

export function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Xác thực email"
      subtitle="Nhập mã OTP đã gửi đến email của bạn để kích hoạt tài khoản trước khi đăng nhập."
      panelAlign="center"
      panelEyebrow="Bảo mật tài khoản"
      panelHeading="Hoàn tất bước cuối."
      panelBody="Mã OTP giúp đảm bảo tài khoản thuộc đúng người đăng ký. Sau khi xác thực, bạn có thể đăng nhập và sử dụng hệ thống."
      footer={
        <>
          Muốn dùng email khác?{' '}
          <Link to="/register" className="text-fg transition-colors hover:text-fg">
            Đăng ký lại
          </Link>
        </>
      }
    >
      <VerifyEmailForm />
    </AuthLayout>
  )
}
