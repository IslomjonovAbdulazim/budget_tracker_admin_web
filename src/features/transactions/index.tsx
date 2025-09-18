import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Receipt, RefreshCw, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransactions } from '@/hooks/use-transactions'
import { type TransactionsQueryParams } from '@/services/transactions'
import { getPageNumbers } from '@/lib/utils'
import { TransactionsTable } from './components/transactions-table'

export function Transactions() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<Partial<TransactionsQueryParams>>({})
  
  const { data: response, isLoading, error, refetch, isRefetching } = useTransactions({
    page: currentPage,
    pageSize: pageSize,
    ...filters,
  })

  const transactions = response?.data || []
  const pagination = response?.pagination

  const updateFilters = (newFilters: Partial<TransactionsQueryParams>) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
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

        {/* Transactions Table */}
        <TransactionsTable 
          data={transactions} 
          onFiltersChange={updateFilters}
          currentFilters={filters}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
        />

        {!isLoading && !error && (
          <>
            {/* Advanced Pagination */}
            {pagination && (
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} transactions
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rows per page</span>
                    <Select 
                      value={pageSize.toString()} 
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(1)}
                        disabled={!pagination.hasPrevious}
                      >
                        <span className="sr-only">Go to first page</span>
                        <DoubleArrowLeftIcon className="h-4 w-4" />
                      </Button>
                      
                      {/* Previous page */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page number buttons */}
                      {getPageNumbers(pagination.page, pagination.totalPages).map((pageNumber, index) => (
                        <div key={`${pageNumber}-${index}`} className="flex items-center">
                          {pageNumber === '...' ? (
                            <span className="text-muted-foreground px-1 text-sm">...</span>
                          ) : (
                            <Button
                              variant={pagination.page === pageNumber ? 'default' : 'outline'}
                              className="h-8 min-w-8 px-2"
                              onClick={() => setCurrentPage(pageNumber as number)}
                            >
                              <span className="sr-only">Go to page {pageNumber}</span>
                              {pageNumber}
                            </Button>
                          )}
                        </div>
                      ))}

                      {/* Next page */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Last page */}
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(pagination.totalPages)}
                        disabled={!pagination.hasNext}
                      >
                        <span className="sr-only">Go to last page</span>
                        <DoubleArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Main>
    </>
  )
}