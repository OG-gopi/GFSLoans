import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
}

export function RouteGuard({ children, allowedRoles, requireAuth = true }: RouteGuardProps) {
  const { isAuthenticated, role, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to appropriate dashboard
    return <Navigate to={getDashboardPath(role)} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export function getDashboardPath(role?: UserRole | null): string {
  if (!role) return '/login'
  switch (role) {
    case 'superadmin': return '/superadmin/dashboard'
    case 'loan_admin': return '/admin/loans/dashboard'
    case 'insurance_admin': return '/admin/insurance/dashboard'
    case 'investment_admin': return '/admin/investments/dashboard'
    case 'loan_agent': return '/agent/dashboard'
    case 'insurance_agent': return '/agent/dashboard'
    case 'investment_agent': return '/agent/dashboard'
    default: return '/login'
  }
}
