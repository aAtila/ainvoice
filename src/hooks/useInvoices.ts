'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useState } from 'react';
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoice,
  getInvoices,
  searchInvoices,
  getInvoiceStats,
  markInvoiceAsPaid,
  duplicateInvoice,
} from '@/lib/actions/invoices';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilter,
  InvoiceSearch,
  MarkAsPaidInput,
} from '@/lib/validations/invoice';
import { useDebounce } from './useDebounce';

// SWR key factories
const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filter: InvoiceFilter) => [...invoiceKeys.lists(), filter] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  stats: () => [...invoiceKeys.all, 'stats'] as const,
  search: (query: string) => [...invoiceKeys.all, 'search', query] as const,
};

// Fetcher functions
async function fetcher<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['data']> {
  const result = await fn(...args);
  if (!result.success) {
    throw new Error(result.error || 'An error occurred');
  }
  return result.data;
}

// Hook to get list of invoices
export function useInvoices(filter: InvoiceFilter = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    invoiceKeys.list(filter),
    () => fetcher(getInvoices, filter)
  );

  return {
    invoices: data?.invoices || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook to get a single invoice
export function useInvoice(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? invoiceKeys.detail(id) : null,
    () => fetcher(getInvoice, id!)
  );

  return {
    invoice: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook to get invoice statistics
export function useInvoiceStats() {
  const { data, error, isLoading } = useSWR(
    invoiceKeys.stats(),
    () => fetcher(getInvoiceStats)
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}

// Hook to search invoices
export function useInvoiceSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, error, isLoading } = useSWR(
    debouncedQuery ? invoiceKeys.search(debouncedQuery) : null,
    () => fetcher(searchInvoices, { query: debouncedQuery!, limit: 10 })
  );

  return {
    results: data || [],
    isLoading,
    error,
  };
}

// Hook to create an invoice
export function useCreateInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateInvoiceInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createInvoice(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create invoice');
      }

      // Revalidate all invoice lists and stats
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'invoices',
        undefined,
        { revalidate: true }
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    isLoading,
    error,
  };
}

// Hook to update an invoice
export function useUpdateInvoice(id: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (input: UpdateInvoiceInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateInvoice(id, input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update invoice');
      }

      // Revalidate the specific invoice and all lists
      await Promise.all([
        mutate(invoiceKeys.detail(id)),
        mutate(
          (key) => Array.isArray(key) && key[0] === 'invoices' && key[1] === 'list',
          undefined,
          { revalidate: true }
        ),
        mutate(invoiceKeys.stats()),
      ]);

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    update,
    isLoading,
    error,
  };
}

// Hook to delete an invoice
export function useDeleteInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInv = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteInvoice(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete invoice');
      }

      // Revalidate all invoice lists and stats
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'invoices',
        undefined,
        { revalidate: true }
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteInvoice: deleteInv,
    isLoading,
    error,
  };
}

// Hook to mark invoice as paid
export function useMarkInvoiceAsPaid(id: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsPaid = useCallback(async (input: MarkAsPaidInput = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await markInvoiceAsPaid(id, input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark invoice as paid');
      }

      // Revalidate the specific invoice and all lists
      await Promise.all([
        mutate(invoiceKeys.detail(id)),
        mutate(
          (key) => Array.isArray(key) && key[0] === 'invoices' && key[1] === 'list',
          undefined,
          { revalidate: true }
        ),
        mutate(invoiceKeys.stats()),
      ]);

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark invoice as paid';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    markAsPaid,
    isLoading,
    error,
  };
}

// Hook to duplicate an invoice
export function useDuplicateInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await duplicateInvoice(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate invoice');
      }

      // Revalidate all invoice lists
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'invoices',
        undefined,
        { revalidate: true }
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    duplicate,
    isLoading,
    error,
  };
}