import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authService, type AuthUser, type LoginRequest } from '@/services/auth'
import { toast } from 'sonner'

const ACCESS_TOKEN = 'budget_tracker_token'

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    isLoading: boolean
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    login: (credentials: LoginRequest) => Promise<boolean>
    isAuthenticated: () => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  const initUser = initToken ? authService.parseToken(initToken) : null
  const isTokenValid = initToken && !authService.isTokenExpired(initToken)
  
  return {
    auth: {
      user: isTokenValid ? initUser : null,
      accessToken: isTokenValid ? initToken : '',
      isLoading: false,
      
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      
      setAccessToken: (accessToken) =>
        set((state) => {
          const user = authService.parseToken(accessToken)
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken, 
              user,
              isLoading: false 
            } 
          }
        }),
      
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '', user: null } }
        }),
      
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', isLoading: false },
          }
        }),
      
      login: async (credentials: LoginRequest) => {
        set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }))
        
        try {
          const response = await authService.login(credentials)
          get().auth.setAccessToken(response.access_token)
          toast.success('Login successful!')
          return true
        } catch (error: any) {
          const message = error?.response?.data?.detail || 'Invalid credentials'
          toast.error(message)
          set((state) => ({ ...state, auth: { ...state.auth, isLoading: false } }))
          return false
        }
      },
      
      isAuthenticated: () => {
        const { accessToken } = get().auth
        return accessToken !== '' && !authService.isTokenExpired(accessToken)
      },
    },
  }
})
