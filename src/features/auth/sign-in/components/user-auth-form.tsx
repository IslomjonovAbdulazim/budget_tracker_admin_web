import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { formatPhoneInput, validatePhoneNumber } from '@/lib/phone-utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  phone: z
    .string()
    .min(1, 'Please enter your phone number')
    .refine(validatePhoneNumber, 'Please enter a valid Uzbekistan phone number (+998xxxxxxxxx)'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const phoneValue = form.watch('phone')
  const passwordValue = form.watch('password')

  useEffect(() => {
    if (phoneValue) {
      const formatted = formatPhoneInput(phoneValue)
      if (formatted !== phoneValue) {
        form.setValue('phone', formatted, { shouldValidate: false })
      }
      // Clear phone field error when user starts typing
      if (form.formState.errors.phone) {
        form.clearErrors('phone')
      }
    }
  }, [phoneValue, form])

  useEffect(() => {
    // Clear password field error when user starts typing
    if (passwordValue && form.formState.errors.password) {
      form.clearErrors('password')
    }
  }, [passwordValue, form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const success = await auth.login(data)
    
    if (success) {
      // Always redirect to home page after successful login
      navigate({ to: '/', replace: true })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder='+998 (91) 123-45-67' 
                  {...field}
                  maxLength={19}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Enter your password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={auth.isLoading}>
          {auth.isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
