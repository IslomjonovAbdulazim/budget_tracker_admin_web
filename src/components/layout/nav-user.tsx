import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  User,
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { formatPhoneDisplay } from '@/lib/phone-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'

type NavUserProps = {
  user?: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()

  const displayUser = auth.user ? {
    name: 'Admin',
    phone: formatPhoneDisplay(auth.user.phone),
    avatar: '',
  } : user

  if (!displayUser) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                  <AvatarFallback className='rounded-lg'>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{displayUser.name}</span>
                  <span className='truncate text-xs'>
                    {'phone' in displayUser ? displayUser.phone : displayUser.email}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                    <AvatarFallback className='rounded-lg'>
                      <User className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{displayUser.name}</span>
                    <span className='truncate text-xs'>
                      {'phone' in displayUser ? displayUser.phone : displayUser.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <BadgeCheck />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
