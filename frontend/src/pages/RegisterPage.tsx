import { Link } from 'react-router-dom'
import { AuthLayout, RegisterForm } from '../components/auth'

export function RegisterPage() {
  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      subtitle="Thiết lập quyền truy cập cho vận hành, bảo vệ và điều phối bãi đỗ cư dân."
      panelEyebrow="Khởi tạo // Quy mô vận hành"
      panelHeading="Một bảng điều khiển cho mọi làn xe."
      panelBody="Từ tầng hầm đến khu khách vãng lai, khởi tạo tòa nhà trong vài phút và đồng bộ dữ liệu ra vào ở mọi điểm vào."
      panelStats={[
        { value: '18', label: 'Làn xe được hỗ trợ' },
        { value: '+1 (312) 847-1928', label: 'Đường dây hỗ trợ cài đặt' },
      ]}
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-fg hover:text-fg transition-colors">
            Đăng nhập
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
