import { useState } from 'react'
import { type CategoriesQueryParams } from '@/services/categories'
import { useCategories } from '@/hooks/use-categories'
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
import { Skeleton } from '@/components/ui/skeleton'

interface CategoriesTableProps {
  typeFilter?: 'income' | 'expense'
}

export function CategoriesTable({ typeFilter }: CategoriesTableProps) {
  const [params] = useState<CategoriesQueryParams>({
    type: typeFilter,
    skip: 0,
    limit: 100,
  })

  const {
    data: categories,
    isLoading,
    error,
  } = useCategories(params)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load categories</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No categories found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Names</TableHead>
            <TableHead>Keywords</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="flex items-center gap-2">
                {category.emoji && (
                  <span className="text-lg">{category.emoji}</span>
                )}
                <span className="font-medium">{category.title}</span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={category.type === 'income' ? 'default' : 'secondary'}
                  className={category.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                >
                  {category.type}
                </Badge>
              </TableCell>
              <TableCell>
                {category.names && (
                  <div className="space-y-1 text-sm">
                    <div><strong>EN:</strong> {category.names.en}</div>
                    <div><strong>UZ:</strong> {category.names.uz}</div>
                    <div><strong>RU:</strong> {category.names.ru}</div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {category.keywords && category.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {category.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {category.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{category.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}