'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ClientForm from '@/components/clients/ClientForm';
import { useCreateClient } from '@/hooks/useClients';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { CreateClientInput } from '@/lib/validations/client';

export default function NewClientPage() {
  const router = useRouter();
  const { createClient, isLoading, error } = useCreateClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateClientInput) => {
    setSubmitError(null);
    try {
      await createClient(data);
      router.push('/clients');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumb */}
      <div>
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link 
            href="/clients" 
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clients
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">New Client</span>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Back to clients"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Client
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a new client profile
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || submitError) && (
        <ErrorMessage message={submitError || error || 'Failed to create client'} />
      )}

      {/* Client Form */}
      <ClientForm onSubmit={handleSubmit} isSubmitting={isLoading} />
    </div>
  );
}