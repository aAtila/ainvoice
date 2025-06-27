import { LineItemInput } from '@/lib/validations/invoice';
import { InvoiceStatus } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';

// Calculate amount for a line item (quantity * rate)
export function calcAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate);
}

// Calculate tax amount for a given amount and tax rate
export function calcTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100));
}

// Build complete line item with calculated totals
export function buildLineTotals(item: LineItemInput) {
  const amount = calcAmount(item.quantity, item.rate);
  const taxAmount = calcTax(amount, item.taxRate ?? 0);
  const total = amount + taxAmount;

  return {
    ...item,
    amount,
    taxAmount,
    total,
  };
}

// Calculate aggregate totals for all line items
export function aggregateTotals(items: LineItemInput[]) {
  const itemsWithTotals = items.map(buildLineTotals);
  
  return itemsWithTotals.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.amount,
      taxTotal: acc.taxTotal + item.taxAmount,
      total: acc.total + item.total,
    }),
    { subtotal: 0, taxTotal: 0, total: 0 }
  );
}

// Generate invoice number with prefix and suffix
export function generateInvoiceNumber(
  nextNumber: number,
  prefix: string = 'INV-',
  suffix: string = ''
): string {
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${paddedNumber}${suffix}`;
}

// Determine invoice status based on dates and payment
export function computeStatus(
  currentStatus: InvoiceStatus,
  dueDate: Date,
  paidAt?: Date | null
): InvoiceStatus {
  // If paid, always return paid
  if (paidAt) {
    return 'paid';
  }

  // If cancelled, keep it cancelled
  if (currentStatus === 'cancelled') {
    return 'cancelled';
  }

  // Check if overdue
  const now = new Date();
  if (dueDate < now && currentStatus !== 'draft') {
    return 'overdue';
  }

  // Otherwise, return current status
  return currentStatus;
}

// Check if status transition is valid
export function isValidStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): boolean {
  // Define valid transitions
  const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['paid', 'overdue', 'cancelled'],
    paid: [], // Cannot transition from paid
    overdue: ['paid', 'cancelled'],
    cancelled: ['draft'], // Can only go back to draft
  };

  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

// Format invoice for display (with currency symbols)
export function formatInvoiceDisplay(invoice: {
  currency: string;
  total: number;
  subtotal: number;
  taxTotal: number;
}) {
  return {
    total: formatCurrency(invoice.total, invoice.currency),
    subtotal: formatCurrency(invoice.subtotal, invoice.currency),
    taxTotal: formatCurrency(invoice.taxTotal, invoice.currency),
  };
}

// Calculate payment terms date
export function calculateDueDate(invoiceDate: Date, paymentTerms: number): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + paymentTerms);
  return dueDate;
}

// Check if invoice is editable based on status
export function isInvoiceEditable(status: InvoiceStatus): boolean {
  return status === 'draft';
}

// Check if invoice can be deleted
export function isInvoiceDeletable(status: InvoiceStatus): boolean {
  return status === 'draft' || status === 'cancelled';
}

// Get status color for UI
export function getStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
}

// Calculate days overdue
export function getDaysOverdue(dueDate: Date): number {
  const now = new Date();
  if (dueDate >= now) return 0;
  
  const diffTime = Math.abs(now.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Build line items for Prisma create/update
export function buildPrismaLineItems(items: LineItemInput[]) {
  return items.map(item => {
    const totals = buildLineTotals(item);
    return {
      description: totals.description,
      quantity: totals.quantity,
      rate: totals.rate,
      taxRate: totals.taxRate ?? 0,
      amount: totals.amount,
      taxAmount: totals.taxAmount,
      total: totals.total,
    };
  });
}