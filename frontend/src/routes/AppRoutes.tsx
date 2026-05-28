import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { BookingPage } from '../pages/BookingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ManagerBookingsPage } from '../pages/ManagerBookingsPage'
import { ManagerDashboardPage } from '../pages/ManagerDashboardPage'
import { ManagerGateLogsPage } from '../pages/ManagerGateLogsPage'
import { ManagerReportsPage } from '../pages/ManagerReportsPage'
import { ManagerSlotsPage } from '../pages/ManagerSlotsPage'
import { ManagerStaffPage } from '../pages/ManagerStaffPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { RegisterPage } from '../pages/RegisterPage'
import { StaffGatePage } from '../pages/StaffGatePage'
import { StaffIncidentsPage } from '../pages/StaffIncidentsPage'
import { StaffLostTicketPage } from '../pages/StaffLostTicketPage'
import { StaffShiftPage } from '../pages/StaffShiftPage'
import { StaffVehiclesPage } from '../pages/StaffVehiclesPage'
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
        <Route path="/staff" element={<StaffGatePage />} />
        <Route path="/staff/vehicles" element={<StaffVehiclesPage />} />
        <Route path="/staff/lost-ticket" element={<StaffLostTicketPage />} />
        <Route path="/staff/incidents" element={<StaffIncidentsPage />} />
        <Route path="/staff/shift" element={<StaffShiftPage />} />
      </Route>
      <Route path="/staff-gate" element={<Navigate to="/staff" replace />} />
      <Route element={<ManagerLayout />}>
        <Route path="/manager" element={<ManagerDashboardPage />} />
        <Route path="/manager/slots" element={<ManagerSlotsPage />} />
        <Route path="/manager/bookings" element={<ManagerBookingsPage />} />
        <Route path="/manager/gate-logs" element={<ManagerGateLogsPage />} />
        <Route path="/manager/staff" element={<ManagerStaffPage />} />
        <Route path="/manager/reports" element={<ManagerReportsPage />} />
      </Route>
    </Routes>
  )
}
