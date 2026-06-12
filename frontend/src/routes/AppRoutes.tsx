import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { AdminBookingsPage } from '../pages/AdminBookingsPage'
import { AdminBuildingsPage } from '../pages/AdminBuildingsPage'
import { AdminFloorsPage } from '../pages/AdminFloorsPage'
import { AdminGateLogsPage } from '../pages/AdminGateLogsPage'
import { AdminManagersPage } from '../pages/AdminManagersPage'
import { AdminPlansPage } from '../pages/AdminPlansPage'
import { AdminReportsPage } from '../pages/AdminReportsPage'
import { AdminSlotsPage } from '../pages/AdminSlotsPage'
import { AdminStaffPage } from '../pages/AdminStaffPage'
import { AdminSubscriptionsPage } from '../pages/AdminSubscriptionsPage'
import { BookingPage } from '../pages/BookingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ManagerBuildingsPage } from '../pages/ManagerBuildingsPage'
import { ManagerBookingsPage } from '../pages/ManagerBookingsPage'
import { ManagerDashboardPage } from '../pages/ManagerDashboardPage'
import { ManagerGateLogsPage } from '../pages/ManagerGateLogsPage'
import { ManagerPlansPage } from '../pages/ManagerPlansPage'
import { ManagerReportsPage } from '../pages/ManagerReportsPage'
import { ManagerSlotsPage } from '../pages/ManagerSlotsPage'
import { ManagerStaffPage } from '../pages/ManagerStaffPage'
import { ManagerSubscriptionsPage } from '../pages/ManagerSubscriptionsPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { MySubscriptionsPage } from '../pages/MySubscriptionsPage'
import { PaymentResultPage } from '../pages/PaymentResultPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResidentSubscriptionPage } from '../pages/ResidentSubscriptionPage'
import { StaffGatePage } from '../pages/StaffGatePage'
import { StaffIncidentsPage } from '../pages/StaffIncidentsPage'
import { StaffLostTicketPage } from '../pages/StaffLostTicketPage'
import { StaffShiftPage } from '../pages/StaffShiftPage'
import { StaffVehiclesPage } from '../pages/StaffVehiclesPage'
import { UserManagementPage } from '../pages/UserManagementPage'
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
          <Route path="/staff" element={<StaffGatePage />} />
          <Route path="/staff/vehicles" element={<StaffVehiclesPage />} />
          <Route path="/staff/lost-ticket" element={<StaffLostTicketPage />} />
          <Route path="/staff/incidents" element={<StaffIncidentsPage />} />
          <Route path="/staff/shift" element={<StaffShiftPage />} />
        </Route>
      </Route>
      <Route path="/staff-gate" element={<Navigate to="/staff" replace />} />
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
