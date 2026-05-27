import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

// ─── Props ────────────────────────────────────────────────────────────────────
interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
}

// ─── Page content animation ───────────────────────────────────────────────────
const pageVariants = {
  hidden:  { opacity: 0, y: 8  },
  visible: { opacity: 1, y: 0  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AppShell({ children, pageTitle }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  return (
    <div
      className="flex h-screen overflow-hidden text-slate-850 relative"
      style={{
        background: '#F8FAFD', // Clean cool-white base
      }}
    >
      {/* ── Subtle Micro Dot Pattern ──────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 0.8px, transparent 0.8px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Soft Cool Ambient Glow Spheres ────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        {/* Gentle Blue-Violet Top-Right Glow */}
        <div
          className="absolute -top-[15%] right-[5%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[130px]"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, #a5b4fc 50%, transparent 80%)' }}
        />
        {/* Gentle Teal Bottom-Left Glow */}
        <div
          className="absolute -bottom-[15%] -left-[5%] w-[550px] h-[550px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #67e8f9 0%, #a5f3fc 50%, transparent 80%)' }}
        />
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="relative flex flex-col flex-1 min-w-0 z-10">
        {/* TopBar */}
        <TopBar pageTitle={pageTitle} onMenuToggle={toggleSidebar} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            key={pageTitle}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {/* Inner padding wrapper */}
            <div className="p-6 min-h-full">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
