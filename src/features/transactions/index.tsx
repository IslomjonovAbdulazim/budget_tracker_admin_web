import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Receipt, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactions } from '@/hooks/use-transactions'
import { TransactionsTable } from './components/transactions-table'

export function Transactions() {
  const { data: transactions, isLoading, error, refetch, isRefetching } = useTransactions({
    skip: 0,
    limit: 1000, // Get more transactions for analytics
  })

  const calculateSummary = () => {
    if (!transactions) return { income: 0, expense: 0, balance: 0, total: 0 }
    
    const activeTransactions = transactions.filter(t => t.is_active)
    const income = activeTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.edited_amount ?? t.amount), 0)
    
    const expense = activeTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.edited_amount ?? t.amount), 0)
    
    return {
      income,
      expense,
      balance: income - expense,
      total: activeTransactions.length
    }
  }

  const summary = calculateSummary()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

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
              <Receipt className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Transactions</h2>
              <p className='text-muted-foreground'>
                Monitor all user transactions and financial activities
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
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load transactions</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Active transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.income)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All active income
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.expense)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All active expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <DollarSign className={`h-4 w-4 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Income - Expenses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <TransactionsTable data={transactions || []} />
          </>
        )}
      </Main>
    </>
  )
}