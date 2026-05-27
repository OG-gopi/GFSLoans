import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  user: Profile | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionExpiry: string | null
  setUser: (user: Profile | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoading: true,
      isAuthenticated: false,
      sessionExpiry: null,

      setUser: (user) => set({
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
      }),

      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },

      initialize: async () => {
        set({ isLoading: true })
        
        // Transparent Offline Demo mode check
        if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
          console.warn('[GFS Auth] Running in Offline Demo Mode. Bypassing network initialization.')
          const current = get()
          if (current.isAuthenticated && current.user) {
            set({ isLoading: false })
            return
          }
          set({ user: null, role: null, isAuthenticated: false, isLoading: false })
          return
        }

        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()

            if (profile) {
              set({
                user: profile as Profile,
                role: profile.role as UserRole,
                isAuthenticated: true,
                sessionExpiry: session.expires_at
                  ? new Date(session.expires_at * 1000).toISOString()
                  : null,
              })
            }
          }
        } catch (error) {
          console.error('[GFS Auth] Initialization error:', error)
          set({ user: null, role: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'gfs-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
