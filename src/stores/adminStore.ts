import { create } from 'zustand'

interface AdminState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAdminStore = create<AdminState>(set => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setToken: token => {
    localStorage.setItem('token', token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem('token')
    set({ token: null })
  }
}))
