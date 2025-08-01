import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  permissions: string[]
  lastLoginAt: string
  avatar?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
  updateUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (username: string, password: string) => {
        try {
          // 模拟登录API调用
          const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })

          if (response.ok) {
            const data = await response.json()
            const { user, token } = data

            set({
              isAuthenticated: true,
              user,
              token,
            })

            return true
          } else {
            // 开发环境下的模拟登录
            if (username === 'admin' && password === 'admin123') {
              const mockUser: AuthUser = {
                id: '1',
                username: 'admin',
                email: 'admin@divine-friend.com',
                role: 'admin',
                permissions: ['*'],
                lastLoginAt: new Date().toISOString(),
                avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
              }

              set({
                isAuthenticated: true,
                user: mockUser,
                token: 'mock-jwt-token',
              })

              return true
            }
            return false
          }
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        })
      },

      refreshToken: async () => {
        try {
          const { token } = get()
          if (!token) return false

          const response = await fetch('/api/admin/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            set({ token: data.token })
            return true
          } else {
            // Token 过期，清除状态
            get().logout()
            return false
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          get().logout()
          return false
        }
      },

      updateUser: (user: AuthUser) => {
        set({ user })
      },
    }),
    {
      name: 'divine-friend-admin-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
)
