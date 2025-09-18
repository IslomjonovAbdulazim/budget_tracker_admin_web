import { useQuery } from '@tanstack/react-query'
import { transactionsService, type TransactionsQueryParams } from '@/services/transactions'

export function useTransactions(params?: TransactionsQueryParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsService.getTransactions(params),
  })
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsService.getTransactionById(id),
    enabled: !!id,
  })
}

export function useUserSummary(userId: number) {
  return useQuery({
    queryKey: ['userSummary', userId],
    queryFn: () => transactionsService.getUserSummary(userId),
    enabled: !!userId,
  })
}