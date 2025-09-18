import { useQuery } from '@tanstack/react-query'
import { categoriesService, type CategoriesQueryParams } from '@/services/categories'

export function useCategories(params?: CategoriesQueryParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesService.getCategories(params),
  })
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getCategoryById(id),
    enabled: !!id,
  })
}