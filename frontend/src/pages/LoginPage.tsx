import { Link } from 'react-router-dom'
import { AuthLayout, LoginForm } from '../components/auth'

export function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your building"
      subtitle="Monitor gates, occupancy, and resident parking from one secure console."
      panelAlign="center"
      panelEyebrow="Hello"
      panelHeading="Welcome back."
      panelBody="Your building parking console is ready. Sign in to pick up where you left off."
      footer={
        <>
          Need an account?{' '}
          <Link to="/register" className="text-white hover:text-gray-200 transition-colors">
            Register your property
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
