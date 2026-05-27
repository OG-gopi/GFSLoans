import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Calendar, Clock, ClipboardList, CheckCircle2, ChevronRight,
  TrendingUp, Shield, HelpCircle, Phone, ArrowUpRight, Calculator, PlusCircle
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    customersCount: 0,
    todayFollowups: 0,
    monthApplications: 0,
    pendingReviews: 0
  })
  const [followups, setFollowups] = useState<any[]>([])
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      if (!user?.id) return

      // Load counts
      const [custRes, followRes, loansRes, policiesRes, invsRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact' }).eq('agent_id', user.id).eq('is_deleted', false),
        supabase.from('follow_ups').select('id', { count: 'exact' }).eq('agent_id', user.id).eq('is_completed', false),
        supabase.from('loans').select('id, status').eq('agent_id', user.id).eq('is_deleted', false),
        supabase.from('insurance_policies').select('id, status').eq('agent_id', user.id).eq('is_deleted', false),
        supabase.from('investments').select('id, status').eq('agent_id', user.id).eq('is_deleted', false)
      ])

      const totalLoans = loansRes.data || []
      const totalPolicies = policiesRes.data || []
      const totalInvs = invsRes.data || []

      const pendingLoans = totalLoans.filter(l => ['lead', 'verification'].includes(l.status)).length
      const pendingPolicies = totalPolicies.filter(p => p.status === 'pending').length
      const pendingInvs = totalInvs.filter(i => i.status === 'pending').length

      setStats({
        customersCount: custRes.count || 0,
        todayFollowups: followRes.count || 0,
        monthApplications: totalLoans.length + totalPolicies.length + totalInvs.length,
        pendingReviews: pendingLoans + pendingPolicies + pendingInvs
      })

      // Fetch upcoming followups
      const today = new Date().toISOString().split('T')[0]
      const { data: fUps } = await supabase
        .from('follow_ups')
        .select('*, customer:customers(full_name, phone)')
        .eq('agent_id', user.id)
        .eq('is_completed', false)
        .order('scheduled_at', { ascending: true })
        .limit(5)

      setFollowups(fUps || [])

      // Fetch last 5 customers
      const { data: recentCusts } = await supabase
        .from('customers')
        .select('*')
        .eq('agent_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentCustomers(recentCusts || [])

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function completeFollowup(fUpId: string) {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({ is_completed: true })
        .eq('id', fUpId)

      if (error) throw error
      toast.success('Follow-up marked as completed')
      setFollowups(prev => prev.filter(f => f.id !== fUpId))
      setStats(prev => ({ ...prev, todayFollowups: Math.max(0, prev.todayFollowups - 1) }))
    } catch (err) {
      toast.error('Failed to complete follow-up')
    }
  }

  const statCards = [
    { title: 'My Total Customers', value: stats.customersCount, subtitle: 'Registered profiles', icon: <Users className="w-5 h-5" />, accentColor: '#D4AF37' },
    { title: "Today's Follow-ups", value: stats.todayFollowups, subtitle: 'Open interactions', icon: <Calendar className="w-5 h-5" />, accentColor: '#3B82F6' },
    { title: 'Total Applications', value: stats.monthApplications, subtitle: 'Cumulative portfolio count', icon: <TrendingUp className="w-5 h-5" />, accentColor: '#10B981' },
    { title: 'Pending Reviews', value: stats.pendingReviews, subtitle: 'Under underwriting review', icon: <Clock className="w-5 h-5" />, accentColor: '#EAB308' }
  ]

  const quickActions = [
    { label: 'Register Customer', icon: <PlusCircle className="w-5 h-5" />, color: '#D4AF37', href: '/agent/customers/new' },
    { label: 'My Customer Directory', icon: <Users className="w-5 h-5" />, color: '#3B82F6', href: '/agent/customers' },
    { label: 'EMI Calculator Tool', icon: <Calculator className="w-5 h-5" />, color: '#10B981', href: '/agent/calculator' },
    { label: 'Upcoming Follow-ups', icon: <Calendar className="w-5 h-5" />, color: '#A855F7', href: '/agent/follow-ups' }
  ]

  return (
    <AppShell pageTitle="Agent Dashboard">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, <span className="gold-text">{user?.full_name?.split(' ')[0] || 'Agent'}</span> 👋
        </h1>
        <p className="text-navy-400 text-sm mt-1">
          Monitor your customer directory, check follow-ups, and calculate loan EMIs.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="stat-card group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden border border-slate-200/60 rounded-2xl bg-white"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3.5px]" style={{ backgroundColor: card.accentColor }} />
            <div className="flex items-start justify-between relative z-10 text-slate-800">
              <div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{card.title}</p>
                <p className="text-2xl font-bold mt-1 font-serif" style={{ color: card.accentColor }}>{card.value}</p>
                <p className="text-slate-400 text-xs mt-1 font-medium">{card.subtitle}</p>
              </div>
              <div
                className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: `${card.accentColor}10`, border: `1px solid ${card.accentColor}20` }}
              >
                <div style={{ color: card.accentColor }}>{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Followups panel */}
        <div className="lg:col-span-2 gfs-card p-6">
          <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" /> My Upcoming Follow-ups
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-navy-400 py-4 text-center">Loading follow-ups...</p>
            ) : followups.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-navy-700/60 bg-navy-900/30 hover:border-gold-500/20 transition-all">
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.customer?.full_name}</h4>
                  <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-2">
                    <span className="font-medium text-gold-500">{formatDate(item.scheduled_at)}</span>
                    <span>•</span>
                    <span>{item.notes || 'No notes added'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a href={`tel:${item.customer?.phone}`} className="p-2 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => completeFollowup(item.id)}
                    className="btn-gold px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && followups.length === 0 && (
              <p className="text-sm text-navy-400 py-8 text-center">No upcoming follow-ups scheduled.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="gfs-card p-6 flex flex-col gap-4">
          <h3 className="text-foreground font-semibold mb-2">Quick Shortcuts</h3>
          {quickActions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-navy-700 hover:border-gold-500/40 bg-navy-850 hover:bg-navy-800 transition-all group"
            >
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: `${action.color}15`, border: `1px solid ${action.color}25` }}
              >
                <div style={{ color: action.color }}>{action.icon}</div>
              </div>
              <span className="text-foreground text-sm font-medium group-hover:text-gold-400 transition-colors">
                {action.label}
              </span>
              <ChevronRight className="w-4 h-4 text-navy-500 ml-auto group-hover:text-gold-500 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent customers */}
      <div className="gfs-card p-6">
        <h3 className="text-foreground font-semibold mb-4">Recently Registered Customers</h3>
        <div className="overflow-x-auto">
          <table className="gfs-table w-full">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Registered Date</th>
                <th>Occupation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading directory...</td></tr>
              ) : recentCustomers.map((cust, i) => (
                <tr key={i}>
                  <td className="font-semibold text-white">{cust.full_name}</td>
                  <td>{cust.phone}</td>
                  <td className="text-xs">{formatDate(cust.created_at)}</td>
                  <td>{cust.occupation || '—'}</td>
                  <td>
                    <a href={`/agent/customers/${cust.id}`} className="text-xs text-gold-500 hover:underline">
                      View Directory Profile
                    </a>
                  </td>
                </tr>
              ))}
              {!isLoading && recentCustomers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-navy-400 text-sm">No customers registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
