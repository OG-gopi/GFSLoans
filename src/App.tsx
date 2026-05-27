import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Error Pages
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Super Admin
import SuperAdminDashboard from '@/pages/superadmin/Dashboard'
import UsersPage from '@/pages/superadmin/UsersPage'
import AuditLogsPage from '@/pages/superadmin/AuditLogsPage'

// Admin - Loans
import LoanAdminDashboard from '@/pages/admin/loans/LoanAdminDashboard'
import LoanApplicationsPage from '@/pages/admin/loans/LoanApplicationsPage'

// Admin - Insurance
import InsuranceAdminDashboard from '@/pages/admin/insurance/InsuranceAdminDashboard'
import PoliciesPage from '@/pages/admin/insurance/PoliciesPage'

// Admin - Investments
import InvestmentAdminDashboard from '@/pages/admin/investments/InvestmentAdminDashboard'
import InvestmentsPage from '@/pages/admin/investments/InvestmentsPage'

// Agent
import AgentDashboard from '@/pages/agent/AgentDashboard'
import CustomersPage from '@/pages/agent/CustomersPage'
import CustomerDetail from '@/pages/agent/CustomerDetail'
import AddCustomerPage from '@/pages/agent/AddCustomerPage'
import EMICalculator from '@/pages/agent/EMICalculator'
import FollowUpsPage from '@/pages/agent/FollowUpsPage'

// Route Guards
import { RouteGuard, getDashboardPath } from '@/middleware/RouteGuard'

export default function App() {
  const { initialize, role, isAuthenticated } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0F1629',
            border: '1px solid #1E2D4A',
            color: '#F0E6C8',
          },
        }}
      />
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={getDashboardPath(role)} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Public Auth Routes */}
        <Route path="/login" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/forgot-password" element={<RouteGuard requireAuth={false}><ForgotPasswordPage /></RouteGuard>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* ─── SUPER ADMIN ─────────────────────────────── */}
        <Route path="/superadmin">
          <Route
            path="dashboard"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="users"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <UsersPage />
              </RouteGuard>
            }
          />
          <Route
            path="audit-logs"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <AuditLogsPage />
              </RouteGuard>
            }
          />
          {/* Super admin can also see all module pages */}
          <Route
            path="loans"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <LoanApplicationsPage />
              </RouteGuard>
            }
          />
          <Route
            path="insurance"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <PoliciesPage />
              </RouteGuard>
            }
          />
          <Route
            path="investments"
            element={
              <RouteGuard allowedRoles={['superadmin']}>
                <InvestmentsPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* ─── LOAN ADMIN ───────────────────────────────── */}
        <Route path="/admin/loans">
          <Route
            path="dashboard"
            element={
              <RouteGuard allowedRoles={['loan_admin', 'superadmin']}>
                <LoanAdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="applications"
            element={
              <RouteGuard allowedRoles={['loan_admin', 'superadmin']}>
                <LoanApplicationsPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* ─── INSURANCE ADMIN ──────────────────────────── */}
        <Route path="/admin/insurance">
          <Route
            path="dashboard"
            element={
              <RouteGuard allowedRoles={['insurance_admin', 'superadmin']}>
                <InsuranceAdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="policies"
            element={
              <RouteGuard allowedRoles={['insurance_admin', 'superadmin']}>
                <PoliciesPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* ─── INVESTMENT ADMIN ─────────────────────────── */}
        <Route path="/admin/investments">
          <Route
            path="dashboard"
            element={
              <RouteGuard allowedRoles={['investment_admin', 'superadmin']}>
                <InvestmentAdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="portfolios"
            element={
              <RouteGuard allowedRoles={['investment_admin', 'superadmin']}>
                <InvestmentsPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* ─── AGENT ────────────────────────────────────── */}
        <Route path="/agent">
          <Route
            path="dashboard"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <AgentDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="customers"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <CustomersPage />
              </RouteGuard>
            }
          />
          <Route
            path="customers/new"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <AddCustomerPage />
              </RouteGuard>
            }
          />
          <Route
            path="customers/:id"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <CustomerDetail />
              </RouteGuard>
            }
          />
          <Route
            path="calculator"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <EMICalculator />
              </RouteGuard>
            }
          />
          <Route
            path="follow-ups"
            element={
              <RouteGuard allowedRoles={['loan_agent', 'insurance_agent', 'investment_agent']}>
                <FollowUpsPage />
              </RouteGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
