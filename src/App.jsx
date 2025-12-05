import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ManageUsers } from './pages/admin/ManageUsers'
import { AdminPatientManagement } from './pages/admin/ManagePatients'
import { AdminScheduleManagement } from './pages/admin/ManageSchedules'
import { SecretaryDashboard } from './pages/secretary/SecretaryDashboard'
import { PatientManagement } from './pages/secretary/PatientManagement'
import { ScheduleManagement } from './pages/secretary/ScheduleManagement'
import { DoctorDashboard } from './pages/doctor/DoctorDashboard'
import { MyPatients } from './pages/doctor/MyPatients'
import { Prescriptions } from './pages/doctor/Prescriptions'
import './lib/i18n'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPatientManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminScheduleManagement />
                </ProtectedRoute>
              }
            />

            {/* Secretary Routes */}
            <Route
              path="/secretary"
              element={
                <ProtectedRoute allowedRoles={['secretary']}>
                  <SecretaryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/secretary/patients"
              element={
                <ProtectedRoute allowedRoles={['secretary']}>
                  <PatientManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/secretary/schedules"
              element={
                <ProtectedRoute allowedRoles={['secretary']}>
                  <ScheduleManagement />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <MyPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/schedules"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <ScheduleManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Unauthorized Route */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
