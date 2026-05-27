import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ─── Zod Schema ───────────────────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type ForgotFormData = z.infer<typeof forgotSchema>

// ─── Background Orb ───────────────────────────────────────────
function BackgroundOrb({ x, y, size, color }: { x: string; y: string; size: string; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    const result = await sendPasswordReset(data.email)

    if (result?.error) {
      setAuthError(result.error)
      setIsSubmitting(false)
      return
    }

    setSubmittedEmail(data.email)
    setIsSuccess(true)
    toast.success('Reset link sent!', { description: `Check your inbox at ${data.email}` })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg relative overflow-hidden p-4">
      {/* Animated background orbs */}
      <BackgroundOrb x="-10%" y="-10%" size="500px" color="rgba(212,175,55,0.05)" />
      <BackgroundOrb x="60%" y="60%" size="400px" color="rgba(26,51,128,0.08)" />
      <BackgroundOrb x="80%" y="-20%" size="300px" color="rgba(212,175,55,0.03)" />

      {/* Gold line grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-[#070b12] border border-[#D4AF37]/40 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
          >
            <img
              src="/gfs-logo.png"
              alt="GFS"
              className="w-full h-full object-cover scale-110"
            />
          </motion.div>
          <motion.p
            className="text-slate-400 text-xs mt-3 tracking-widest uppercase font-semibold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Greetwell Financial Services
          </motion.p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {/* ── SUCCESS STATE ── */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="text-center py-4"
              >
                {/* Animated check circle */}
                <motion.div
                  className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle2 size={36} className="text-gold-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-navy-400 text-sm mb-2">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="text-gold-400 font-medium text-sm mb-6 break-all">
                  {submittedEmail}
                </p>

                <div className="space-y-3 text-left bg-navy-800/40 rounded-xl p-4 mb-6 border border-navy-700/50">
                  {[
                    'Open the email from GFS',
                    'Click the "Reset Password" button',
                    'Create your new secure password',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-navy-300 text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <p className="text-navy-500 text-xs mb-5">
                  Didn&apos;t receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setIsSuccess(false)
                      setAuthError(null)
                    }}
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    try again
                  </button>
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              /* ── FORM STATE ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
                    <Send size={20} className="text-gold-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Reset your password</h2>
                  <p className="text-navy-400 text-sm">
                    Enter your email and we&apos;ll send you a secure reset link.
                  </p>
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
                      <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-400 text-sm">{authError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label className="gfs-label">Email Address</label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                      />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="you@gfs.com"
                        className="gfs-input pl-10"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Sending reset link…
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                {/* Back link */}
                <div className="mt-6 pt-5 border-t border-navy-700/60 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-gold-400 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-navy-600 text-xs mt-6">
          © {new Date().getFullYear()} Greetwell Financial Services. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
