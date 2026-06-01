import { Link } from 'react-router-dom'
import { AuthLayout, LoginForm } from '../components/auth'

export function LoginPage() {
  return (
    <AuthLayout
      title="Đăng nhập vào hệ thống tòa nhà"
      subtitle="Theo dõi cổng, chỗ trống và bãi đỗ cư dân từ một bảng điều khiển an toàn."
      panelAlign="center"
      panelEyebrow="Xin chào"
      panelHeading="Chào mừng trở lại."
      panelBody="Bảng điều khiển bãi đỗ của tòa nhà đã sẵn sàng. Đăng nhập để tiếp tục công việc của bạn."
      footer={
        <>
          Cần tài khoản?{' '}
          <Link to="/register" className="text-fg hover:text-fg transition-colors">
            Đăng ký tài khoản
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
