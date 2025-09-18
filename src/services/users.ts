import { apiClient } from '@/lib/api-client'

export interface User {
  id: number
  telegram_id: string
  username: string | null
  fullname: string | null
  created_at: string
}

export interface UsersQueryParams {
  skip?: number
  limit?: number
}

export const usersService = {
  async getUsers(params?: UsersQueryParams): Promise<User[]> {
    const response = await apiClient.get<User[]>('/api/users/', {
      params,
    })
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${id}`)
    return response.data
  },

  async getUserByTelegramId(telegramId: string): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/telegram/${telegramId}`)
    return response.data
  },
}