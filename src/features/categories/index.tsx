import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tags, Plus } from 'lucide-react'
import { CategoriesTable } from './components/categories-table'

export function Categories() {
  const [activeTab, setActiveTab] = useState('all')

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
              <Tags className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
              <p className='text-muted-foreground'>
                Manage income and expense categories
              </p>
            </div>
          </div>
          <Button>
            <Plus className='h-4 w-4' />
            Add Category
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full max-w-md grid-cols-3'>
            <TabsTrigger value='all'>All Categories</TabsTrigger>
            <TabsTrigger value='income'>Income</TabsTrigger>
            <TabsTrigger value='expense'>Expense</TabsTrigger>
          </TabsList>

          <TabsContent value='all' className='space-y-4'>
            <CategoriesTable />
          </TabsContent>

          <TabsContent value='income' className='space-y-4'>
            <CategoriesTable typeFilter='income' />
          </TabsContent>

          <TabsContent value='expense' className='space-y-4'>
            <CategoriesTable typeFilter='expense' />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}