'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { Client } from '@prisma/client';

interface ClientWithCounts extends Client {
  _count: {
    invoices: number;
    timeEntries: number;
  };
}

interface ClientCardProps {
  client: ClientWithCounts;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const formatLocation = () => {
    const parts = [client.city, client.state, client.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <Card 
      hoverable 
      className="h-full flex flex-col cursor-pointer"
      onClick={onEdit}
    >
      <div className="p-6 flex-1 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {client.name}
          </h3>
          {client.taxId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tax ID: {client.taxId}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          
          {formatLocation() && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{formatLocation()}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2">
          {client._count.invoices > 0 && (
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {client._count.invoices} invoice{client._count.invoices !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {client._count.timeEntries > 0 && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {client._count.timeEntries} time {client._count.timeEntries !== 1 ? 'entries' : 'entry'}
              </span>
            </div>
          )}
          
          {client._count.invoices === 0 && client._count.timeEntries === 0 && (
            <Badge variant="default" size="sm">New</Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Edit client"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Delete client"
          disabled={client._count.invoices > 0}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}