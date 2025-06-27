import { z } from 'zod';
import { VALIDATION } from '@/lib/constants';

// Line item schema for invoice lines
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(VALIDATION.MAX_DESCRIPTION_LENGTH),
  quantity: z.number()
    .min(VALIDATION.MIN_QUANTITY, `Quantity must be at least ${VALIDATION.MIN_QUANTITY}`)
    .max(VALIDATION.MAX_QUANTITY, `Quantity must be at most ${VALIDATION.MAX_QUANTITY}`),
  rate: z.number()
    .int('Rate must be in minor units (cents)')
    .min(VALIDATION.MIN_RATE, 'Rate must be positive')
    .max(VALIDATION.MAX_RATE, `Rate must be at most ${VALIDATION.MAX_RATE}`),
  taxRate: z.number()
    .min(0, 'Tax rate must be positive')
    .max(100, 'Tax rate cannot exceed 100%')
    .default(0),
});

// Base invoice schema with common fields
const invoiceBaseSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  currency: z.string()
    .min(3, 'Currency code must be at least 3 characters')
    .max(5, 'Currency code must be at most 5 characters')
    .toUpperCase(),
  lineItems: z.array(lineItemSchema)
    .min(VALIDATION.MIN_INVOICE_ITEMS, `Invoice must have at least ${VALIDATION.MIN_INVOICE_ITEMS} line item`)
    .max(VALIDATION.MAX_INVOICE_ITEMS, `Invoice cannot have more than ${VALIDATION.MAX_INVOICE_ITEMS} line items`),
  notes: z.string().max(VALIDATION.MAX_NOTES_LENGTH).optional().nullable(),
  terms: z.string().max(VALIDATION.MAX_TERMS_LENGTH).optional().nullable(),
});

// Schema for creating a new invoice
export const createInvoiceSchema = invoiceBaseSchema.extend({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
}).refine(
  (data) => data.dueDate >= data.invoiceDate,
  {
    message: 'Due date must be on or after invoice date',
    path: ['dueDate'],
  }
);

// Schema for updating an existing invoice
export const updateInvoiceSchema = invoiceBaseSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  sentAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
}).refine(
  (data) => {
    // Ensure at least one field is provided
    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    return fields.length > 0;
  },
  {
    message: 'At least one field must be provided for update',
  }
).refine(
  (data) => {
    // Validate status transitions
    if (data.status === 'paid' && !data.paidAt) {
      return false;
    }
    return true;
  },
  {
    message: 'Paid date is required when marking invoice as paid',
    path: ['paidAt'],
  }
);

// Schema for filtering invoices
export const invoiceFilterSchema = z.object({
  search: z.string().optional(),
  status: z.union([
    z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    z.array(z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])),
  ]).optional(),
  clientId: z.string().cuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['invoiceNumber', 'invoiceDate', 'dueDate', 'total', 'status', 'clientName']).default('invoiceDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema for invoice search (autocomplete)
export const invoiceSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// Schema for marking invoice as paid
export const markAsPaidSchema = z.object({
  paidAt: z.coerce.date().default(() => new Date()),
});

// Schema for sending invoice
export const sendInvoiceSchema = z.object({
  to: z.string().email('Invalid email address'),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

// Type exports
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFilter = z.infer<typeof invoiceFilterSchema>;
export type InvoiceSearch = z.infer<typeof invoiceSearchSchema>;
export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>;
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;