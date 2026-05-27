import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardPath } from '@/middleware/RouteGuard'
import type { UserRole } from '@/types'

// ─── Zod Schemas ───────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Use'),
})
type LoginFormData = z.infer<typeof loginSchema>

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Please select your role'),
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Use'),
})
type RegisterFormData = z.infer<typeof registerSchema>

const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type RecoverFormData = z.infer<typeof recoverSchema>

// ─── Main Component ───────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, sendPasswordReset, role, isAuthenticated } = useAuth()

  // Tabs: 'signin' | 'signup' | 'recover'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'recover'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Recovery Success State
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(from || getDashboardPath(role), { replace: true })
    }
  }, [isAuthenticated, role, navigate, from])

  // Forms
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false, agreeTerms: true },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeTerms: true, role: 'loan_agent' },
  })

  const recoverForm = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
  })

  // Sign In Handler
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    const result = await signIn(data.email, data.password)
    setIsSubmitting(false)

    if (result?.error) {
      setAuthError(
        result.error.includes('Invalid login credentials')
          ? 'Invalid email or password. Please try again.'
          : result.error
      )
      return
    }

    toast.success('Welcome back!', { description: 'Successfully signed in to GFS Platform.' })
  }

  // Sign Up Handler
  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    // Bypass offline demo mode or check Supabase url
    const result = await signUp(data.email, data.password, data.fullName)
    setIsSubmitting(false)

    if (result?.error) {
      setAuthError(result.error)
      return
    }

    toast.success('Account Created!', { description: 'You can now log in using your credentials.' })
    setActiveTab('signin')
  }

  // Recovery Handler
  const onRecoverSubmit = async (data: RecoverFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    const result = await sendPasswordReset(data.email)
    setIsSubmitting(false)

    if (result?.error) {
      setAuthError(result.error)
      return
    }

    setSubmittedEmail(data.email)
    setRecoverySuccess(true)
    toast.success('Reset link sent!', { description: `Check your inbox at ${data.email}` })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 login-bg relative font-sans overflow-hidden">
      
      {/* Ambient background soft mesh circles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      {/* Main card box container */}
      <div className="glass-panel w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[660px] relative z-10 border border-white/20 shadow-2xl">
        
        {/* ── LEFT PANEL: Tabs & Interactive forms ──────────────────────────── */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 bg-white relative">
          
          {/* Tab Navigation header (exactly like the reference image) */}
          <div className="flex border-b border-slate-100 mb-8 relative">
            {[
              { id: 'signin', label: 'Sign In' },
              { id: 'signup', label: 'Sign Up' },
              { id: 'recover', label: 'Password recovery' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setAuthError(null)
                  setRecoverySuccess(false)
                }}
                className={`flex-1 pb-3.5 text-xs sm:text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-cyan-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form wrapper */}
          <div className="my-auto max-w-sm w-full mx-auto">
            
            {/* Header branding logo mark (Magnificent prominent premium centered logo) */}
            <div className="mb-8 flex flex-col items-center justify-center text-center">
              <div 
                className="w-20 h-20 rounded-2xl bg-[#070b12] flex items-center justify-center border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_28px_rgba(212,175,55,0.6)] mb-3"
              >
                <img 
                  src="/gfs-logo.png" 
                  alt="GFS Brand Logo" 
                  className="w-full h-full object-cover scale-110" 
                />
              </div>
              <h2 className="font-extrabold text-2xl tracking-tight text-[#070b12] uppercase font-serif">
                Greetwell
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] -mt-0.5">
                Financial Services
              </p>
              <div className="h-0.5 w-16 bg-[#D4AF37] mt-2 rounded-full" />
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-red-700 text-xs font-semibold leading-normal">{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ── SIGN IN TAB VIEW ── */}
              {activeTab === 'signin' && (
                <motion.div
                  key="signin-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Welcome Back</h2>
                    <p className="text-slate-400 text-xs mt-1">Please sign in to access your digital portfolio.</p>
                  </div>

                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5 block">Login / Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          {...loginForm.register('email')}
                          type="email"
                          placeholder="Jordan@gmail.com"
                          className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm transition-all duration-200"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          {...loginForm.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                          className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Terms agreement checkbox */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          {...loginForm.register('agreeTerms')}
                          type="checkbox"
                          className="w-4.5 h-4.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/20 cursor-pointer"
                        />
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors leading-relaxed">
                          I agree to GFS Portal <span className="text-cyan-600 hover:underline font-bold">Terms of use</span>
                        </span>
                      </label>
                      {loginForm.formState.errors.agreeTerms && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {loginForm.formState.errors.agreeTerms.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,180,255,0.25)] hover:shadow-[0_6px_22px_rgba(0,180,255,0.45)] hover:-translate-y-0.5 active:translate-y-0"
                      style={{
                        background: 'linear-gradient(90deg, #0081CB 0%, #00C6FF 100%)',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Verifying credentials…
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── SIGN UP TAB VIEW ── */}
              {activeTab === 'signup' && (
                <motion.div
                  key="signup-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-5">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Create Account</h2>
                    <p className="text-slate-400 text-xs mt-1">Register your agent or staff profile.</p>
                  </div>

                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 block">Full Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          {...registerForm.register('fullName')}
                          type="text"
                          placeholder="Jordan Smith"
                          className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all duration-200"
                        />
                      </div>
                      {registerForm.formState.errors.fullName && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {registerForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 block">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          {...registerForm.register('email')}
                          type="email"
                          placeholder="Jordan@gmail.com"
                          className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all duration-200"
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 block">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          {...registerForm.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••"
                          className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 block">Select Profile Role</label>
                      <select
                        {...registerForm.register('role')}
                        className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl px-4 py-2.5 text-sm transition-all duration-200"
                      >
                        <option value="loan_agent">Loan Agent (Specialist)</option>
                        <option value="insurance_agent">Insurance Agent (Specialist)</option>
                        <option value="investment_agent">Investment Wealth Agent</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          {...registerForm.register('agreeTerms')}
                          type="checkbox"
                          className="w-4.5 h-4.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/20 cursor-pointer"
                        />
                        <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors leading-normal">
                          Agree to GFS Portal <span className="text-cyan-600 hover:underline font-bold">Terms of use</span>
                        </span>
                      </label>
                      {registerForm.formState.errors.agreeTerms && (
                        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle size={11} /> {registerForm.formState.errors.agreeTerms.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,180,255,0.25)] hover:shadow-[0_6px_22px_rgba(0,180,255,0.45)] hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(90deg, #0081CB 0%, #00C6FF 100%)',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Registering account…
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── PASSWORD RECOVERY TAB VIEW ── */}
              {activeTab === 'recover' && (
                <motion.div
                  key="recover-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Recover Password</h2>
                    <p className="text-slate-400 text-xs mt-1">Enter your email and we'll send you a recovery link.</p>
                  </div>

                  {recoverySuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-5 rounded-2xl bg-cyan-50/50 border border-cyan-100"
                    >
                      <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="text-cyan-600" size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Check your inbox</h4>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                        We sent a secure password reset link to:
                      </p>
                      <p className="text-cyan-600 font-bold text-xs mt-1 break-all">{submittedEmail}</p>
                      <button
                        type="button"
                        onClick={() => setRecoverySuccess(false)}
                        className="mt-4 text-xs font-bold text-cyan-600 hover:underline"
                      >
                        Try another email
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={recoverForm.handleSubmit(onRecoverSubmit)} className="space-y-5">
                      <div>
                        <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5 block">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            {...recoverForm.register('email')}
                            type="email"
                            placeholder="Jordan@gmail.com"
                            className="w-full bg-[#F0F3FC] border border-slate-200 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500/20 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm transition-all duration-200"
                          />
                        </div>
                        {recoverForm.formState.errors.email && (
                          <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={11} /> {recoverForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,180,255,0.25)] hover:shadow-[0_6px_22px_rgba(0,180,255,0.45)] hover:-translate-y-0.5"
                        style={{
                          background: 'linear-gradient(90deg, #0081CB 0%, #00C6FF 100%)',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending reset link…
                          </>
                        ) : (
                          'Send Recovery Link'
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer lock note */}
          <div className="text-center text-slate-400 text-xs pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Bank-grade secure GFS portal. All connection points logged.
          </div>
        </div>

        {/* ── RIGHT PANEL: Isometric vector illustration hero space ──────────────────────────── */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-10 relative text-white bg-gradient-to-br from-[#0B2144] via-[#0F3266] to-[#0A1931] overflow-hidden">
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Top Brand Tag */}
          <div className="flex items-center justify-center relative z-10 gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
              <img src="/gfs-logo.png" alt="GFS Logo" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <span className="font-bold tracking-widest text-xs uppercase text-cyan-400">GFS digital portal</span>
          </div>

          {/* Welcome Text Header */}
          <div className="text-center max-w-sm mx-auto relative z-10 mt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-tight font-serif text-white">
              Welcome to the GFS Greetwell digital wallet
            </h2>
            <p className="text-cyan-100/70 text-xs leading-relaxed max-w-xs mx-auto">
              Access your Unified Dashboard, verify underwriting reviews, and track client portfolios from one premium hub.
            </p>
          </div>

          {/* Isometric Custom Vector Graph (matching reference infographic style perfectly!) */}
          <div className="relative w-full h-[220px] my-auto flex items-center justify-center z-10 scale-105">
            <svg className="w-full h-full max-w-[340px]" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              
              {/* Isometric grid block representing digital space */}
              <path d="M120 180 L220 130 L120 80 L20 130 Z" fill="#152B52" opacity="0.45" />
              <path d="M120 170 L205 127.5 L120 85 L35 127.5 Z" fill="#1A3461" opacity="0.6" />
              
              {/* Giant Upward trending glow arrow */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                d="M45 140 Q 110 100 160 55"
                stroke="url(#arrowGlowGradient)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="arrowGlowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0081CB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00C6FF" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Arrow Head pointing up */}
              <path d="M165 40 L160 58 L142 55 Z" fill="#00C6FF" />

              {/* Isometric Mock Laptop / Chart Screen */}
              <g transform="translate(70, 75)">
                {/* Laptop Base */}
                <path d="M10 80 L90 80 L110 90 L30 90 Z" fill="#0B1A30" />
                {/* Laptop Screen Frame */}
                <path d="M20 10 L80 10 L80 75 L20 75 Z" fill="#0D1E36" stroke="#00C6FF" strokeWidth="2" strokeLinejoin="round" />
                {/* Rising graph elements inside screen */}
                <path d="M25 65 Q 40 40 50 50 T 75 35" stroke="#FF5B7F" strokeWidth="2.5" fill="none" />
                {/* Bar Metrics */}
                <rect x="30" y="55" width="4" height="10" rx="1" fill="#00C6FF" />
                <rect x="38" y="45" width="4" height="20" rx="1" fill="#00C6FF" />
                <rect x="46" y="50" width="4" height="15" rx="1" fill="#00C6FF" />
                <rect x="54" y="35" width="4" height="30" rx="1" fill="#FFC107" />
                <rect x="62" y="40" width="4" height="25" rx="1" fill="#FFC107" />
              </g>

              {/* Isometric Phone displaying growth ring */}
              <g transform="translate(145, 95)">
                {/* Phone body */}
                <path d="M10 5 L35 15 L25 65 L0 55 Z" fill="#0A182F" stroke="#00C6FF" strokeWidth="1.5" />
                {/* Micro ring */}
                <circle cx="18" cy="35" r="8" stroke="#00E676" strokeWidth="2" fill="none" />
                <path d="M18 27 A 8 8 0 0 1 26 35" stroke="#FFD600" strokeWidth="2.5" />
              </g>

              {/* Isometric stacks of gold cash banknotes */}
              <g transform="translate(110, 160)">
                <path d="M0 5 L35 0 L50 7 L15 12 Z" fill="#00E676" opacity="0.8" />
                <path d="M0 9 L35 4 L50 11 L15 16 Z" fill="#00C853" opacity="0.9" stroke="#fff" strokeWidth="0.5" />
                <path d="M0 13 L35 8 L50 15 L15 20 Z" fill="#009624" stroke="#fff" strokeWidth="0.5" />
              </g>

              {/* Character 1 (Left - pointing at metric screen) */}
              <g transform="translate(25, 80)">
                {/* Body/Suit */}
                <path d="M15 50 L30 50 L35 85 L20 85 Z" fill="#1565C0" />
                <path d="M20 50 L25 50 L25 65 L20 65 Z" fill="#fff" /> {/* Shirt */}
                {/* Head */}
                <circle cx="22" cy="40" r="5" fill="#FFCC80" />
                {/* Hair */}
                <path d="M17 38 Q 22 34 27 38 L27 41 L17 41 Z" fill="#3E2723" />
                {/* Arm pointing */}
                <path d="M28 50 L48 40 L50 43 L30 54 Z" fill="#FFCC80" />
              </g>

              {/* Character 2 (Right - leaning on phone card) */}
              <g transform="translate(170, 85)">
                {/* Suit */}
                <path d="M15 45 L28 45 L30 85 L18 85 Z" fill="#1E88E5" />
                <path d="M18 45 L22 45 L22 55 L18 55 Z" fill="#fff" />
                {/* Head */}
                <circle cx="21" cy="35" r="5" fill="#FFCC80" />
                {/* Hair */}
                <path d="M16 33 Q 21 29 26 33 L26 36 L16 36 Z" fill="#212121" />
                {/* Leaning arm */}
                <path d="M15 48 L-5 52 L-5 55 L15 51 Z" fill="#FFCC80" />
              </g>

            </svg>
          </div>

          {/* Bottom security logo note */}
          <div className="text-center text-cyan-200/50 text-[10px] tracking-wide mt-2">
            © {new Date().getFullYear()} Greetwell Financial. All rights reserved.
          </div>

        </div>

      </div>
    </div>
  )
}
