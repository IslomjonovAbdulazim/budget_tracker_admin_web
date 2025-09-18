import { apiClient } from '@/lib/api-client'

export interface CategoryNames {
  en: string
  uz: string
  ru: string
}

export interface Category {
  id: number
  title: string
  type: 'income' | 'expense'
  emoji: string | null
  names: CategoryNames | null
  keywords: string[] | null
}

export interface CategoriesQueryParams {
  type?: 'income' | 'expense'
  skip?: number
  limit?: number
}

export const categoriesService = {
  async getCategories(params?: CategoriesQueryParams): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/categories/', {
      params,
    })
    return response.data
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/categories/${id}`)
    return response.data
  },
}