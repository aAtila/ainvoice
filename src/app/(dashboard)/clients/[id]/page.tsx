"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ClientForm from "@/components/clients/ClientForm";
import {
  useClient,
  useUpdateClient,
  useDeleteClient,
  useClientStats,
} from "@/hooks/useClients";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { UpdateClientInput } from "@/lib/validations/client";

interface ClientPageProps {
  params: {
    id: string;
  };
}

export default function EditClientPage({ params }: ClientPageProps) {
  const router = useRouter();
  const {
    client,
    isLoading: isLoadingClient,
    error: clientError,
  } = useClient(params.id);
  const { stats } = useClientStats(params.id);
  const {
    updateClient,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateClient(params.id);
  const {
    deleteClient,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteClient();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = async (data: UpdateClientInput) => {
    setSubmitError(null);
    try {
      await updateClient(data);
      router.push("/clients");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update client"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClient(params.id);
      router.push("/clients");
    } catch {
      // Error is handled by the hook
      setShowDeleteModal(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={clientError?.message || "Client not found"} />
        <Link href="/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

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
          <span className="text-gray-900 dark:text-white">{client.name}</span>
        </nav>

        <div className="flex items-center justify-between">
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
                Edit Client
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update client information
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting || (stats && stats.totalInvoices > 0)}
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalInvoices}
              </p>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paid Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.paidRevenue)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Hours
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalHours.toFixed(1)}h
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Invoices */}
      {client.invoices && client.invoices.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Invoices
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {client.invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "overdue"
                          ? "error"
                          : invoice.status === "sent"
                          ? "info"
                          : "default"
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {(updateError || submitError || deleteError) && (
        <ErrorMessage
          message={
            submitError || updateError || deleteError || "An error occurred"
          }
        />
      )}

      {/* Client Form */}
      <ClientForm
        client={client}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this client? This action cannot be
            undone.
          </p>
          {stats && stats.totalInvoices > 0 && (
            <ErrorMessage
              message={`This client has ${stats.totalInvoices} invoice(s) and cannot be deleted.`}
              showIcon
            />
          )}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting || (stats && stats.totalInvoices > 0)}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
