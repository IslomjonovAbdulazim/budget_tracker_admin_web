import { useQuery } from '@tanstack/react-query'
import { usersService, type UsersQueryParams } from '@/services/users'

export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  })
}

export function useUserByTelegramId(telegramId: string) {
  return useQuery({
    queryKey: ['user', 'telegram', telegramId],
    queryFn: () => usersService.getUserByTelegramId(telegramId),
    enabled: !!telegramId,
  })
}