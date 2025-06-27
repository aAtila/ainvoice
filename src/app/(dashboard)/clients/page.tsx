'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClients } from '@/hooks/useClients';
import ClientList from '@/components/clients/ClientList';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import type { ClientFilter } from '@/lib/validations/client';

type ViewMode = 'table' | 'grid';

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<ClientFilter>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { clients, pagination, isLoading, error, mutate } = useClients(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof ClientFilter, value: string | boolean | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSort = (sortBy: ClientFilter['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your client information and relationships
          </p>
        </div>
        <Link href="/clients/new">
          <Button variant="primary" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="search"
              placeholder="Search clients by name, email, or phone..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              prefix={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                placeholder="Filter by city"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                options={[
                  { value: '', label: 'All cities' },
                  // These would be populated from actual data
                ]}
              />
              <Select
                placeholder="Filter by state"
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                options={[
                  { value: '', label: 'All states' },
                  // These would be populated from actual data
                ]}
              />
              <Select
                label="Sort by"
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleSort(e.target.value as ClientFilter['sortBy'])}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'email', label: 'Email' },
                  { value: 'createdAt', label: 'Date Created' },
                  { value: 'updatedAt', label: 'Last Updated' },
                ]}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border-l pl-4">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-label="Table view"
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <ErrorMessage message={error.message || 'Failed to load clients'} />
      )}

      {/* Client List */}
      <ClientList
        clients={clients}
        viewMode={viewMode}
        isLoading={isLoading}
        onRefresh={mutate}
      />

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} clients
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}