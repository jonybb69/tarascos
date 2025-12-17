'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  isAuthenticated: boolean
  admin: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,

      // Simula autenticación básica
      login: async (username, password) => {
        // Puedes cambiar las credenciales según necesites
        const ADMIN_USER = 'admin'
        const ADMIN_PASS = 'tarascos123'

        if (username === ADMIN_USER && password === ADMIN_PASS) {
          localStorage.setItem('admin-token', 'tarascos-session')
          set({ isAuthenticated: true, admin: username })
          return true
        } else {
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('admin-token')
        set({ isAuthenticated: false, admin: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
