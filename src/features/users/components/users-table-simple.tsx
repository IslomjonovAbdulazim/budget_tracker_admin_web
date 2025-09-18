import { format } from 'date-fns'
import { type User } from '@/services/users'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UsersTableProps {
  data: User[]
}

export function UsersTable({ data }: UsersTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const openTelegramProfile = (username: string | null, telegramId: string) => {
    if (username) {
      window.open(`https://t.me/${username}`, '_blank')
    } else {
      window.open(`https://t.me/user?id=${telegramId}`, '_blank')
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.fullname || 'Unknown User'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {user.username ? (
                  <button
                    onClick={() => openTelegramProfile(user.username, user.telegram_id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
                  >
                    @{user.username}
                  </button>
                ) : (
                  <button
                    onClick={() => openTelegramProfile(null, user.telegram_id)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Open Profile
                  </button>
                )}
              </TableCell>
              <TableCell>
                {user.fullname || (
                  <span className="text-muted-foreground text-sm">
                    Not provided
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDate(user.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}