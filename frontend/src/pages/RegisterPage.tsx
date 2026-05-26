import { Link } from 'react-router-dom'
import { AuthLayout, RegisterForm } from '../components/auth'

export function RegisterPage() {
  return (
    <AuthLayout
      title="Register your property"
      subtitle="Set up building access for operators, security staff, and resident parking coordinators."
      panelEyebrow="Onboarding // Fleet scale"
      panelHeading="One console for every lane."
      panelBody="From basement stacks to visitor overflow, onboard your structure in minutes and keep clearance data synchronized across every entry point."
      panelStats={[
        { value: '18', label: 'Lanes supported' },
        { value: '+1 (312) 847-1928', label: 'On-call setup line' },
      ]}
      footer={
        <>
          Returning user?{' '}
          <Link to="/login" className="text-fg hover:text-fg transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
