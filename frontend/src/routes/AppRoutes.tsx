import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { BookingPage } from '../pages/BookingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { StaffGatePage } from '../pages/StaffGatePage'
import { UserManagementPage } from '../pages/UserManagementPage'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
      </Route>
      <Route element={<StaffLayout />}>
        <Route path="/staff-gate" element={<StaffGatePage />} />
      </Route>
    </Routes>
  )
}
