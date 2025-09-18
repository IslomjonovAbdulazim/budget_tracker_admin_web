import axios, { type AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://budgettrackerrealbackend-production.up.railway.app'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      toast.error('Session expired!')
      useAuthStore.getState().auth.reset()
      window.location.href = '/sign-in'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient