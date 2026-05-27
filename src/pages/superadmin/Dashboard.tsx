import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Users, FileText, Shield, TrendingUp, Building2,
  Clock, AlertTriangle, DollarSign, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Mock data for demo — replace with real Supabase queries
const monthlyData = [
  { month: 'Jan', loans: 45, insurance: 32, investments: 28, revenue: 2400000 },
  { month: 'Feb', loans: 52, insurance: 38, investments: 35, revenue: 2800000 },
  { month: 'Mar', loans: 61, insurance: 45, investments: 42, revenue: 3200000 },
  { month: 'Apr', loans: 55, insurance: 50, investments: 38, revenue: 3100000 },
  { month: 'May', loans: 72, insurance: 58, investments: 55, revenue: 4100000 },
  { month: 'Jun', loans: 68, insurance: 62, investments: 60, revenue: 4500000 },
]

const branchData = [
  { branch: 'Mumbai', loans: 120, insurance: 85, investments: 75 },
  { branch: 'Delhi', loans: 98, insurance: 72, investments: 65 },
  { branch: 'Bangalore', loans: 85, insurance: 60, investments: 80 },
  { branch: 'Chennai', loans: 62, insurance: 48, investments: 45 },
  { branch: 'Hyderabad', loans: 58, insurance: 42, investments: 55 },
]

const moduleDistribution = [
  { name: 'Loans', value: 423, color: '#D4AF37' },
  { name: 'Insurance', value: 307, color: '#3B82F6' },
  { name: 'Investments', value: 335, color: '#10B981' },
]

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#0F1629',
  border: '1px solid #1E2D4A',
  borderRadius: '8px',
  color: '#F0E6C8',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={CUSTOM_TOOLTIP_STYLE} className="p-3 text-sm">
      <p className="text-gold-400 font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}:</span>
          <span className="font-semibold">
            {entry.name === 'revenue' ? formatCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend?: { value: number; isUp: boolean }
  accentColor?: string
  delay?: number
}

function getCardGradient(accentColor: string): string {
  switch (accentColor) {
    case '#D4AF37': // Gold/Revenue
      return 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Gold Pastel
    case '#3B82F6': // Blue/Insurance
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Blue Pastel
    case '#10B981': // Green/Investments
      return 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Green Pastel
    case '#A855F7': // Purple/Customers
      return 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Purple Pastel
    case '#F97316': // Orange/Agents
      return 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Orange Pastel
    case '#EAB308': // Yellow/Pending
      return 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Yellow Pastel
    case '#06B6D4': // Cyan/Monthly
      return 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)' // Soft Cyan Pastel
    default:
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)'
  }
}

function StatCard({ title, value, subtitle, icon, trend, accentColor = '#D4AF37', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden border border-slate-200/60 rounded-2xl bg-white"
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3.5px]" style={{ backgroundColor: accentColor }} />
      <div className="flex items-start justify-between relative z-10 text-slate-800">
        <div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold mt-1 font-serif" style={{ color: accentColor }}>{value}</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">{subtitle}</p>
        </div>
        <div
          className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm"
          style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-xs font-semibold relative z-10">
          {trend.isUp ? <ArrowUpRight className="w-3.5 h-3.5 text-green-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
          <span className={trend.isUp ? 'text-green-600' : 'text-red-500'}>{trend.value}% vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

export default function SuperAdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalLoans: 0, totalPolicies: 0, totalInvestments: 0,
    totalCustomers: 0, activeAgents: 0, pendingApplications: 0,
    monthlyRevenue: 0, totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [loans, insurance, investments, customers, agents] = await Promise.all([
        supabase.from('loans').select('id, loan_amount, status', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('insurance_policies').select('id', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('investments').select('id, invested_amount', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('customers').select('id', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('profiles').select('id', { count: 'exact' }).like('role', '%agent%').eq('is_active', true),
      ])
      const pendingLoans = loans.data?.filter(l => ['lead', 'verification'].includes(l.status)).length || 0
      const totalRevenue = (loans.data?.reduce((sum, l) => sum + (l.loan_amount || 0), 0) || 0)
      setStats({
        totalLoans: loans.count || 0,
        totalPolicies: insurance.count || 0,
        totalInvestments: investments.count || 0,
        totalCustomers: customers.count || 0,
        activeAgents: agents.count || 0,
        pendingApplications: pendingLoans,
        monthlyRevenue: totalRevenue * 0.12,
        totalRevenue,
      })
    } catch (err) {
      console.error('[Dashboard] Stats load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Loan Applications', value: stats.totalLoans.toLocaleString(), subtitle: 'Across all branches', icon: <FileText className="w-5 h-5" />, trend: { value: 14, isUp: true }, accentColor: '#D4AF37', delay: 0 },
    { title: 'Insurance Policies', value: stats.totalPolicies.toLocaleString(), subtitle: 'Active & pending', icon: <Shield className="w-5 h-5" />, trend: { value: 8, isUp: true }, accentColor: '#3B82F6', delay: 0.05 },
    { title: 'Investment Portfolios', value: stats.totalInvestments.toLocaleString(), subtitle: 'All types', icon: <TrendingUp className="w-5 h-5" />, trend: { value: 22, isUp: true }, accentColor: '#10B981', delay: 0.1 },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), subtitle: 'Cumulative disbursements', icon: <DollarSign className="w-5 h-5" />, trend: { value: 18, isUp: true }, accentColor: '#D4AF37', delay: 0.15 },
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), subtitle: 'Registered customers', icon: <Users className="w-5 h-5" />, trend: { value: 11, isUp: true }, accentColor: '#A855F7', delay: 0.2 },
    { title: 'Active Agents', value: stats.activeAgents.toLocaleString(), subtitle: 'Field & desk agents', icon: <Activity className="w-5 h-5" />, trend: { value: 5, isUp: true }, accentColor: '#F97316', delay: 0.25 },
    { title: 'Pending Applications', value: stats.pendingApplications.toLocaleString(), subtitle: 'Awaiting review', icon: <Clock className="w-5 h-5" />, trend: { value: 3, isUp: false }, accentColor: '#EAB308', delay: 0.3 },
    { title: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), subtitle: 'Current month', icon: <Building2 className="w-5 h-5" />, trend: { value: 9, isUp: true }, accentColor: '#06B6D4', delay: 0.35 },
  ]

  return (
    <AppShell pageTitle="Super Admin Dashboard">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, <span className="gold-text">{user?.full_name?.split(' ')[0] || 'Admin'}</span> 👋
        </h1>
        <p className="text-navy-400 text-sm mt-1">
          Here's what's happening across all GFS modules today.
        </p>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 gfs-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground font-semibold">Monthly Revenue</h3>
              <p className="text-navy-400 text-xs mt-0.5">All modules combined</p>
            </div>
            <span className="badge-approved text-xs">+18% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis dataKey="month" tick={{ fill: '#8A9BBE', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#8A9BBE', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Module Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="gfs-card p-6"
        >
          <div className="mb-4">
            <h3 className="text-foreground font-semibold">Module Distribution</h3>
            <p className="text-navy-400 text-xs mt-0.5">Applications by type</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={moduleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {moduleDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {moduleDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-navy-300">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Branch Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gfs-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground font-semibold">Branch Performance</h3>
            <p className="text-navy-400 text-xs mt-0.5">Applications by branch and module</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={branchData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="branch" tick={{ fill: '#8A9BBE', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8A9BBE', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#8A9BBE', fontSize: '12px' }} />
            <Bar dataKey="loans" name="Loans" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            <Bar dataKey="insurance" name="Insurance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="investments" name="Investments" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="gfs-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h3 className="text-foreground font-semibold">Risk Alerts</h3>
        </div>
        <div className="space-y-3">
          {[
            { level: 'HIGH', msg: '3 loan applications with CIBIL score below 600 pending review', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { level: 'MEDIUM', msg: '12 insurance policies expiring in the next 30 days', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { level: 'LOW', msg: '5 investment portfolios showing negative returns this quarter', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          ].map((alert) => (
            <div key={alert.msg} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.bg}`}>
              <span className={`text-xs font-bold ${alert.color} mt-0.5`}>[{alert.level}]</span>
              <p className="text-navy-300 text-sm">{alert.msg}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  )
}
