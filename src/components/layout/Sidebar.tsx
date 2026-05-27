import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  TrendingUp,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calculator,
  UserPlus,
  Bell,
  ClipboardList,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string
  icon: React.ElementType
  path: string
}

// ─── Role → Nav Map ───────────────────────────────────────────────────────────
const NAV_MAP: Record<string, NavItem[]> = {
  superadmin: [
    { label: 'Dashboard',   icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { label: 'Users',       icon: Users,           path: '/superadmin/users' },
    { label: 'Loans',       icon: FileText,        path: '/superadmin/loans' },
    { label: 'Insurance',   icon: Shield,          path: '/superadmin/insurance' },
    { label: 'Investments', icon: TrendingUp,      path: '/superadmin/investments' },
    { label: 'Audit Logs',  icon: ScrollText,      path: '/superadmin/audit-logs' },
  ],
  loan_admin: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin/loans/dashboard' },
    { label: 'Applications',  icon: ClipboardList,   path: '/admin/loans/applications' },
  ],
  insurance_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/insurance/dashboard' },
    { label: 'Policies',  icon: Shield,          path: '/admin/insurance/policies' },
  ],
  investment_admin: [
    { label: 'Dashboard',  icon: LayoutDashboard, path: '/admin/investments/dashboard' },
    { label: 'Portfolio',  icon: TrendingUp,      path: '/admin/investments/portfolios' },
  ],
}

// All agent roles share the same nav
const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/agent/dashboard' },
  { label: 'Customers',    icon: Users,           path: '/agent/customers' },
  { label: 'Add Customer', icon: UserPlus,        path: '/agent/customers/new' },
  { label: 'Follow-ups',   icon: Bell,            path: '/agent/follow-ups' },
  { label: 'Calculator',   icon: Calculator,      path: '/agent/calculator' },
]

function getNavItems(role: UserRole | null): NavItem[] {
  if (!role) return []
  if (role === 'loan_agent' || role === 'insurance_agent' || role === 'investment_agent') {
    return AGENT_NAV
  }
  return NAV_MAP[role] ?? []
}

// ─── Role Badge Colour Map ────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  superadmin:       'bg-white/10 text-white border-white/20',
  loan_admin:       'bg-white/10 text-white border-white/20',
  insurance_admin:  'bg-white/10 text-white border-white/20',
  investment_admin: 'bg-white/10 text-white border-white/20',
  loan_agent:       'bg-white/10 text-white border-white/20',
  insurance_agent:  'bg-white/10 text-white border-white/20',
  investment_agent: 'bg-white/10 text-white border-white/20',
}

const ROLE_LABELS: Record<string, string> = {
  superadmin:       'Super Admin',
  loan_admin:       'Loan Admin',
  insurance_admin:  'Insurance Admin',
  investment_admin: 'Investment Admin',
  loan_agent:       'Loan Agent',
  insurance_agent:  'Insurance Agent',
  investment_agent: 'Investment Agent',
}

// ─── Sidebar variants ─────────────────────────────────────────────────────────
const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 64 },
}

const labelVariants = {
  expanded: { opacity: 1, x: 0, display: 'block' },
  collapsed: { opacity: 0, x: -8, transitionEnd: { display: 'none' } },
}

// ─── Component ────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, signOut } = useAuthStore()
  const navItems = getNavItems(role)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GF'

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen overflow-hidden flex-shrink-0 z-40 text-white"
      style={{
        background: '#002147', // Navy Blue — bold & clear
        borderRight: '3px solid #D4AF37',
        boxShadow: '10px 0 50px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Bold gold ambient glow at top */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#D4AF37]/15 to-transparent pointer-events-none z-0" />

      {/* ── Top Brand Strip ─────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-white/20 relative z-10"
      />

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center px-4 py-5 min-h-[72px] relative z-10"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        {/* Logo mark */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#070b12] border border-[#D4AF37]/35 transition-all duration-300 hover:border-[#D4AF37]/80 hover:scale-105"
          style={{
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
          }}
        >
          <img
            src="/gfs-logo.png"
            alt="GFS Logo"
            className="w-full h-full object-cover transform scale-110"
          />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-xs font-bold leading-tight text-white whitespace-nowrap">
                Greetwell
              </p>
              <p className="text-[10px] text-[#D4AF37] font-semibold whitespace-nowrap leading-tight">
                Financial Services
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Toggle button ─────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[60px] z-50 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-white border border-slate-200 shadow-sm"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-[#070b12] font-bold" />
          : <ChevronLeft  size={12} className="text-[#070b12] font-bold" />}
      </button>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar relative z-10">
        {!collapsed && (
          <motion.p
            variants={labelVariants}
            animate="expanded"
            className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60"
          >
            Navigation
          </motion.p>
        )}

        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={[
                    'w-full relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                    collapsed ? 'justify-center px-0' : '',
                    isActive 
                      ? 'bg-white/10 text-[#D4AF37] border border-[#D4AF37]/35 shadow-[0_2px_12px_rgba(212,175,55,0.12)]' // Gold active label
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#D4AF37]" // Gold active bar
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon
                    size={18}
                    className={isActive ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-white'}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── User footer ───────────────────────────────────────────────── */}
      <div className="p-3 space-y-2 border-t border-white/10 bg-white/5 relative z-10">
        {/* User info */}
        <div
          className={`flex items-center gap-2.5 rounded-xl p-2.5 transition-colors duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          {/* Avatar */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#D4AF37] text-xs font-bold bg-[#070b12] border border-[#D4AF37]/35"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {initials}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.full_name ?? 'GFS User'}
                </p>
                <span
                  className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border bg-white/10 text-[#D4AF37] border-white/20"
                >
                  {ROLE_LABELS[role ?? ''] ?? role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs font-semibold text-slate-350 transition-all duration-200 hover:text-white hover:bg-white/10 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut size={15} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
