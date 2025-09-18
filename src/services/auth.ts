import { apiClient } from '@/lib/api-client'
import { formatPhoneForAPI } from '@/lib/phone-utils'

export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AuthUser {
  phone: string
  exp: number
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formattedPhone = formatPhoneForAPI(credentials.phone)
    
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      phone: formattedPhone,
      password: credentials.password,
    })
    
    return response.data
  },

  parseToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        phone: payload.sub,
        exp: payload.exp,
      }
    } catch {
      return null
    }
  },

  isTokenExpired(token: string): boolean {
    const user = this.parseToken(token)
    if (!user) return true
    
    const now = Math.floor(Date.now() / 1000)
    return user.exp < now
  },
}