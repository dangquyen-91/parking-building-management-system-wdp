import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage'
import { AdminBuildingsPage } from '../pages/admin/AdminBuildingsPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { AdminFloorsPage } from '../pages/admin/AdminFloorsPage'
import { AdminGateLogsPage } from '../pages/admin/AdminGateLogsPage'
import { AdminManagersPage } from '../pages/admin/AdminManagersPage'
import { AdminPlansPage } from '../pages/admin/AdminPlansPage'
import { AdminReportsPage } from '../pages/admin/AdminReportsPage'
import { AdminSlotsPage } from '../pages/admin/AdminSlotsPage'
import { AdminStaffPage } from '../pages/admin/AdminStaffPage'
import { AdminSubscriptionsPage } from '../pages/admin/AdminSubscriptionsPage'
import { UserManagementPage } from '../pages/admin/UserManagementPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ManagerBuildingsPage } from '../pages/manager/ManagerBuildingsPage'
import { ManagerBookingsPage } from '../pages/manager/ManagerBookingsPage'
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage'
import { ManagerGateLogsPage } from '../pages/manager/ManagerGateLogsPage'
import { ManagerPlansPage } from '../pages/manager/ManagerPlansPage'
import { ManagerReportsPage } from '../pages/manager/ManagerReportsPage'
import { ManagerSlotsPage } from '../pages/manager/ManagerSlotsPage'
import { ManagerStaffPage } from '../pages/manager/ManagerStaffPage'
import { ManagerSubscriptionsPage } from '../pages/manager/ManagerSubscriptionsPage'
import { HomePage } from '../pages/public/HomePage'
import { StaffCheckInPage } from '../pages/staff/StaffCheckInPage'
import { StaffCheckOutPage } from '../pages/staff/StaffCheckOutPage'
import { StaffIncidentsPage } from '../pages/staff/StaffIncidentsPage'
import { StaffLostTicketPage } from '../pages/staff/StaffLostTicketPage'
import { StaffShiftPage } from '../pages/staff/StaffShiftPage'
import { StaffVehiclesPage } from '../pages/staff/StaffVehiclesPage'
import { BookingPage } from '../pages/user/BookingPage'
import { MyBookingsPage } from '../pages/user/MyBookingsPage'
import { MySubscriptionsPage } from '../pages/user/MySubscriptionsPage'
import { PaymentResultPage } from '../pages/user/PaymentResultPage'
import { ProfilePage } from '../pages/user/ProfilePage'
import { ResidentSubscriptionPage } from '../pages/user/ResidentSubscriptionPage'
import { ProtectedRoute } from './ProtectedRoute'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
      <Route path="/payment/cancel" element={<PaymentResultPage status="cancel" />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subscriptions" element={<ResidentSubscriptionPage />} />
        <Route path="/my-subscriptions" element={<MySubscriptionsPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/managers" element={<AdminManagersPage />} />
          <Route path="/admin/buildings" element={<AdminBuildingsPage />} />
          <Route path="/admin/floors" element={<AdminFloorsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/slots" element={<AdminSlotsPage />} />
          <Route path="/admin/gate-logs" element={<AdminGateLogsPage />} />
          <Route path="/admin/staff" element={<AdminStaffPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>
      </Route>
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/user-management" element={<Navigate to="/admin/users" replace />} />
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<Navigate to="/staff/check-in" replace />} />
          <Route path="/staff/check-in" element={<StaffCheckInPage />} />
          <Route path="/staff/check-out" element={<StaffCheckOutPage />} />
          <Route path="/staff/vehicles" element={<StaffVehiclesPage />} />
          <Route path="/staff/lost-ticket" element={<StaffLostTicketPage />} />
          <Route path="/staff/incidents" element={<StaffIncidentsPage />} />
          <Route path="/staff/shift" element={<StaffShiftPage />} />
        </Route>
      </Route>
      <Route path="/staff-gate" element={<Navigate to="/staff/check-in" replace />} />
      <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
        <Route element={<ManagerLayout />}>
          <Route path="/manager" element={<ManagerDashboardPage />} />
          <Route path="/manager/buildings" element={<ManagerBuildingsPage />} />
          <Route path="/manager/slots" element={<ManagerSlotsPage />} />
          <Route path="/manager/bookings" element={<ManagerBookingsPage />} />
          <Route path="/manager/gate-logs" element={<ManagerGateLogsPage />} />
          <Route path="/manager/staff" element={<ManagerStaffPage />} />
          <Route path="/manager/plans" element={<ManagerPlansPage />} />
          <Route path="/manager/subscriptions" element={<ManagerSubscriptionsPage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
