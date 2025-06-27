'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  createClient,
  updateClient,
  deleteClient,
  getClient,
  getClients,
  searchClients,
  getClientStats,
} from '@/lib/actions/clients';
import type { 
  CreateClientInput, 
  UpdateClientInput, 
  ClientFilter 
} from '@/lib/validations/client';

// SWR key factory
const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filter: ClientFilter) => [...clientKeys.lists(), filter] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  stats: (id: string) => [...clientKeys.all, 'stats', id] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
};

// Fetcher for server actions
async function fetcher<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ...args: Parameters<T>
) {
  const result = await fn(...args);
  if (!result.success) {
    throw new Error(result.error || 'An error occurred');
  }
  return result.data;
}

// Hook to list clients with pagination and filters
export function useClients(filter: ClientFilter = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    clientKeys.list(filter),
    () => fetcher(getClients, filter),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    clients: data?.clients ?? [],
    pagination: data?.pagination ?? {
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    },
    isLoading,
    error,
    mutate,
  };
}

// Hook to get a single client
export function useClient(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? clientKeys.detail(id) : null,
    () => fetcher(getClient, id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    client: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook to get client statistics
export function useClientStats(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? clientKeys.stats(id) : null,
    () => fetcher(getClientStats, id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}

// Hook to search clients
export function useClientSearch(query: string, enabled = true) {
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, error, isLoading } = useSWR(
    enabled && debouncedQuery ? clientKeys.search(debouncedQuery) : null,
    () => fetcher(searchClients, debouncedQuery),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    results: data ?? [],
    isLoading,
    error,
  };
}

// Hook to create a client
export function useCreateClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateClientInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createClient(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create client');
      }

      // Revalidate client lists
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'clients' && key[1] === 'list',
        undefined,
        { revalidate: true }
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create client';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createClient: create,
    isLoading,
    error,
  };
}

// Hook to update a client
export function useUpdateClient(id: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (input: UpdateClientInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      await mutate(
        clientKeys.detail(id),
        async (currentData: any) => {
          const result = await updateClient(id, input);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to update client');
          }

          return result.data;
        },
        {
          optimisticData: (currentData: any) => ({
            ...currentData,
            ...input,
          }),
          rollbackOnError: true,
          revalidate: false,
        }
      );

      // Revalidate client lists
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'clients' && key[1] === 'list',
        undefined,
        { revalidate: true }
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    updateClient: update,
    isLoading,
    error,
  };
}

// Hook to delete a client
export function useDeleteClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteClient(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete client');
      }

      // Remove from cache and revalidate lists
      await mutate(clientKeys.detail(id), undefined, { revalidate: false });
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'clients' && key[1] === 'list',
        undefined,
        { revalidate: true }
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteClient: remove,
    isLoading,
    error,
  };
}