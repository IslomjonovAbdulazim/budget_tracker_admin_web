import { apiClient } from '@/lib/api-client'

export interface Transaction {
  id: number
  user_id: number
  category_id: number
  type: 'income' | 'expense'
  currency: string
  description: string | null
  amount: number
  edited_amount: number | null
  input_method: string | null
  language: string | null
  transcript: string | null
  audio_file_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSummary {
  user_id: number
  total_income: number
  total_expense: number
  balance: number
}

export interface TransactionsQueryParams {
  user_id?: number
  type?: 'income' | 'expense'
  is_active?: boolean
  category_id?: number
  currency?: string
  language?: string
  input_method?: 'audio' | 'text'
  page?: number
  pageSize?: number
  // Legacy support
  skip?: number
  limit?: number
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedTransactionResponse {
  data: Transaction[]
  pagination: PaginationMeta
}

export const transactionsService = {
  async getTransactions(params?: TransactionsQueryParams): Promise<PaginatedTransactionResponse> {
    const response = await apiClient.get<PaginatedTransactionResponse>('/api/transactions/', {
      params,
    })
    return response.data
  },

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/api/transactions/${id}`)
    return response.data
  },

  async getUserSummary(userId: number): Promise<UserSummary> {
    const response = await apiClient.get<UserSummary>(`/api/transactions/user/${userId}/summary`)
    return response.data
  },

  getAudioUrl(audioPath: string | null): string | null {
    if (!audioPath) return null
    // Use specific base URL for audio files
    const audioBaseUrl = 'https://budgettrackerbackend-production-700e.up.railway.app'
    return `${audioBaseUrl}${audioPath}`
  },
}