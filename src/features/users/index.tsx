import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Users as UsersIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/hooks/use-users'
import { UsersTable } from './components/users-table-simple'

export function Users() {
  const { data: users, isLoading, error, refetch, isRefetching } = useUsers({
    skip: 0,
    limit: 100,
  })

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-primary/10 p-2'>
              <UsersIcon className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
              <p className='text-muted-foreground'>
                Manage Telegram bot users
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load users</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">
                  {users?.filter(u => u.username).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">With Username</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">
                  {users?.filter(u => u.fullname).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">With Full Name</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">
                  {users?.filter(u => !u.username && !u.fullname).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Anonymous</p>
              </div>
            </div>
            <UsersTable data={users || []} />
          </>
        )}
      </Main>
    </>
  )
}
