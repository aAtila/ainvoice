'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientCard from './ClientCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useDeleteClient } from '@/hooks/useClients';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Client } from '@prisma/client';

interface ClientWithCounts extends Client {
  _count: {
    invoices: number;
    timeEntries: number;
  };
}

interface ClientListProps {
  clients: ClientWithCounts[];
  viewMode: 'table' | 'grid';
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ClientList({ clients, viewMode, isLoading, onRefresh }: ClientListProps) {
  const router = useRouter();
  const { deleteClient, isLoading: isDeleting } = useDeleteClient();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; client: ClientWithCounts | null }>({
    isOpen: false,
    client: null,
  });

  const handleDelete = async () => {
    if (!deleteModal.client) return;

    try {
      await deleteClient(deleteModal.client.id);
      setDeleteModal({ isOpen: false, client: null });
      onRefresh();
    } catch {
      // Error is handled by the hook
    }
  };

  const openDeleteModal = (client: ClientWithCounts) => {
    setDeleteModal({ isOpen: true, client });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
        <div className="max-w-sm mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No clients</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new client.
          </p>
          <div className="mt-6">
            <Link href="/clients/new">
              <Button variant="primary">Add New Client</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => router.push(`/clients/${client.id}`)}
              onDelete={() => openDeleteModal(client)}
            />
          ))}
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, client: null })}
          title="Delete Client"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{deleteModal.client?.name}</strong>?
            </p>
            {deleteModal.client && deleteModal.client._count.invoices > 0 && (
              <ErrorMessage 
                message={`This client has ${deleteModal.client._count.invoices} invoice(s) and cannot be deleted.`}
                showIcon
              />
            )}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, client: null })}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={isDeleting || (deleteModal.client && deleteModal.client._count.invoices > 0)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Table view
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">City</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableEmpty message="No clients found" />
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {client.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600 dark:text-gray-400">
                    {client.phone || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-400">
                    {client.city || '-'}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {client._count.invoices}
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <DropdownMenu
                        onEdit={() => router.push(`/clients/${client.id}`)}
                        onDelete={() => openDeleteModal(client)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, client: null })}
        title="Delete Client"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{deleteModal.client?.name}</strong>?
          </p>
          {deleteModal.client && deleteModal.client._count.invoices > 0 && (
            <ErrorMessage 
              message={`This client has ${deleteModal.client._count.invoices} invoice(s) and cannot be deleted.`}
              showIcon
            />
          )}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, client: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting || (deleteModal.client && deleteModal.client._count.invoices > 0)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Dropdown Menu Component
function DropdownMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-3" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-3" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}