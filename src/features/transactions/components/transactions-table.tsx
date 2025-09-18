import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { type Transaction, type TransactionsQueryParams } from '@/services/transactions'
import { type User, usersService } from '@/services/users'
import { type Category, categoriesService } from '@/services/categories'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AudioPlayer } from './audio-player'
import { useAudioManager } from '@/hooks/use-audio-manager'
import { transactionsService } from '@/services/transactions'
import { Mic, Type, X, Play, Pause, Info, DollarSign } from 'lucide-react'

interface TransactionsTableProps {
  data: Transaction[]
  onFiltersChange: (filters: Partial<TransactionsQueryParams>) => void
  currentFilters: Partial<TransactionsQueryParams>
  isLoading?: boolean
  error?: any
  onRetry?: () => void
}

function CompactAudioPlayer({ transaction }: { transaction: Transaction }) {
  const audioUrl = transactionsService.getAudioUrl(transaction.audio_file_path)
  const audioId = transaction.audio_file_path || `transaction-${transaction.id}`
  const { audioRef, playAudio, pauseAudio, isCurrentlyPlaying } = useAudioManager(audioId)
  
  const isPlaying = isCurrentlyPlaying()

  if (!audioUrl) return null

  const handleTogglePlay = async () => {
    try {
      if (isPlaying) {
        pauseAudio()
      } else {
        await playAudio()
      }
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  return (
    <div className="flex items-center">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTogglePlay}
        className="h-6 w-6 p-0"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}

function TransactionDetailDialog({ transaction }: { transaction: Transaction }) {
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState(false)
  
  const [category, setCategory] = useState<Category | null>(null)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryError, setCategoryError] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true)
        setUserError(false)
        const userData = await usersService.getUserById(transaction.user_id)
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        setUserError(true)
      } finally {
        setUserLoading(false)
      }
    }

    const loadCategory = async () => {
      try {
        setCategoryLoading(true)
        setCategoryError(false)
        const categoryData = await categoriesService.getCategoryById(transaction.category_id)
        setCategory(categoryData)
      } catch (error) {
        console.error('Failed to load category:', error)
        setCategoryError(true)
      } finally {
        setCategoryLoading(false)
      }
    }

    loadUser()
    loadCategory()
  }, [transaction.user_id, transaction.category_id])

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'UZS' ? 'UZS' : currency,
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss')
    } catch {
      return dateString
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-4 w-4" />
            Transaction #{transaction.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="p-2 bg-blue-50/50 rounded dark:bg-blue-950/20">
            {userLoading ? (
              <div className="text-sm text-muted-foreground">Loading user...</div>
            ) : userError ? (
              <div className="text-sm text-red-500">Failed to load user</div>
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{user.id}</span>
                  <span className="font-medium text-base">{user.fullname || 'Unknown User'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.username && (
                    <a 
                      href={`https://t.me/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      @{user.username}
                    </a>
                  )}
                  <span className="text-muted-foreground text-xs">{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Main Amount */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-2xl font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatAmount(transaction.edited_amount ?? transaction.amount, transaction.currency)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge 
                variant={transaction.type === 'income' ? 'default' : 'secondary'}
                className={transaction.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              >
                {transaction.type}
              </Badge>
              <Badge variant="outline">{transaction.currency}</Badge>
            </div>
            {transaction.edited_amount && (
              <div className="text-xs text-muted-foreground mt-1 line-through">
                Original: {formatAmount(transaction.amount, transaction.currency)}
              </div>
            )}
          </div>

          {/* Content */}
          {(transaction.description || transaction.transcript || transaction.audio_file_path) && (
            <div className="p-3 bg-muted/30 rounded">
              {transaction.description && (
                <div className="font-medium text-sm mb-1">
                  {transaction.description}
                </div>
              )}
              {transaction.transcript && (
                <div className="text-sm text-muted-foreground italic mb-2">
                  "{transaction.transcript}"
                </div>
              )}
              {transaction.audio_file_path && (
                <AudioPlayer 
                  audioPath={transaction.audio_file_path} 
                  transcript={null}
                />
              )}
            </div>
          )}

          {/* Details */}
          <div className="flex items-center justify-between text-sm flex-wrap gap-3">
            <div className="flex items-center gap-1">
              {transaction.input_method === 'audio' ? (
                <Mic className="h-4 w-4 text-blue-500" />
              ) : (
                <Type className="h-4 w-4 text-gray-500" />
              )}
              <span className="capitalize">{transaction.input_method || 'Unknown'}</span>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {transaction.language || 'N/A'}
            </Badge>

            <Badge 
              variant={transaction.is_active ? 'default' : 'secondary'}
              className={transaction.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
              }
            >
              {transaction.is_active ? 'Active' : 'Cancelled'}
            </Badge>

            <div className="flex items-center gap-1">
              {categoryLoading ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : categoryError ? (
                <span className="font-mono">#{transaction.category_id}</span>
              ) : category ? (
                <>
                  {category.emoji && <span>{category.emoji}</span>}
                  <span>{category.title}</span>
                  <span className="text-xs text-muted-foreground">#{category.id}</span>
                </>
              ) : (
                <span className="font-mono">#{transaction.category_id}</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Created {formatDate(transaction.created_at)}</span>
            <span>Updated {formatDate(transaction.updated_at)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TransactionsTable({ data, onFiltersChange, currentFilters, isLoading, error, onRetry }: TransactionsTableProps) {
  const updateFilter = (key: keyof TransactionsQueryParams, value: any) => {
    const newFilters = { ...currentFilters }
    if (value === 'all' || value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const formatAmount = (amount: number, editedAmount: number | null, currency: string) => {
    const displayAmount = editedAmount ?? amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'UZS' ? 'UZS' : currency,
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
    }).format(displayAmount)
  }


  // Remove this early return - we want to show filters even with no data

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select 
          value={currentFilters.type || 'all'} 
          onValueChange={(value) => updateFilter('type', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={currentFilters.input_method || 'all'} 
          onValueChange={(value) => updateFilter('input_method', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={currentFilters.currency || 'all'} 
          onValueChange={(value) => updateFilter('currency', value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="UZS">UZS</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={currentFilters.language || 'all'} 
          onValueChange={(value) => updateFilter('language', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="uz">Uzbek</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ru">Russian</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead className="min-w-[300px]">Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load transactions</p>
          {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead className="min-w-[300px]">Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono">
                    <div className="flex flex-col">
                      <span className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount, transaction.edited_amount, transaction.currency)}
                      </span>
                      {transaction.edited_amount && (
                        <span className="text-xs text-muted-foreground line-through">
                          Original: {formatAmount(transaction.amount, null, transaction.currency)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[300px]">
                    <div className="space-y-1">
                      {transaction.description && (
                        <p className="text-sm line-clamp-2 leading-relaxed">
                          {transaction.description}
                        </p>
                      )}
                      {transaction.transcript && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                          "{transaction.transcript}"
                        </p>
                      )}
                      {!transaction.description && !transaction.transcript && (
                        <span className="text-sm text-muted-foreground">No description</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CompactAudioPlayer transaction={transaction} />
                      <TransactionDetailDialog transaction={transaction} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}