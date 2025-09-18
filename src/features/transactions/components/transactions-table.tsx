import { useState } from 'react'
import { format } from 'date-fns'
import { type Transaction } from '@/services/transactions'
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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AudioPlayer } from './audio-player'
import { Mic, Type, Filter, X } from 'lucide-react'

interface TransactionsTableProps {
  data: Transaction[]
}

export function TransactionsTable({ data }: TransactionsTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [inputMethodFilter, setInputMethodFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = data.filter((transaction) => {
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false
    if (inputMethodFilter !== 'all' && transaction.input_method !== inputMethodFilter) return false
    if (currencyFilter !== 'all' && transaction.currency !== currencyFilter) return false
    if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.transcript?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const clearFilters = () => {
    setTypeFilter('all')
    setInputMethodFilter('all')
    setCurrencyFilter('all')
    setSearchTerm('')
  }

  const formatAmount = (amount: number, editedAmount: number | null, currency: string) => {
    const displayAmount = editedAmount ?? amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'UZS' ? 'UZS' : currency,
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
    }).format(displayAmount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const getUniqueValues = (field: keyof Transaction) => {
    return [...new Set(data.map(item => item[field]).filter(Boolean))]
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search description or transcript..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={inputMethodFilter} onValueChange={setInputMethodFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {getUniqueValues('currency').map((currency) => (
              <SelectItem key={currency} value={currency as string}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} size="sm">
          <X className="h-4 w-4" />
          Clear
        </Button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredData.length} of {data.length} transactions
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Input Method</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'secondary'}
                    className={transaction.type === 'income' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                
                <TableCell className="font-mono">
                  <div className="flex flex-col">
                    <span className={`font-medium ${
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

                <TableCell className="max-w-xs">
                  {transaction.description && (
                    <div className="mb-1 text-sm">
                      {transaction.description}
                    </div>
                  )}
                  {transaction.input_method === 'audio' && (
                    <AudioPlayer 
                      audioPath={transaction.audio_file_path} 
                      transcript={transaction.transcript}
                    />
                  )}
                  {transaction.input_method === 'text' && transaction.transcript && (
                    <div className="text-sm text-muted-foreground italic">
                      "{transaction.transcript}"
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    {transaction.input_method === 'audio' ? (
                      <Mic className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Type className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm capitalize">
                      {transaction.input_method || 'Unknown'}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {transaction.language && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.language}
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Badge 
                    variant={transaction.is_active ? 'default' : 'secondary'}
                    className={transaction.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {transaction.is_active ? 'Active' : 'Cancelled'}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm">
                  {formatDate(transaction.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}