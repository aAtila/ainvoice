// Core type definitions for AInvoice
// Re-export Prisma types and add custom form/utility types

export {
  User,
  Client,
  Invoice,
  InvoiceLineItem,
  TimeEntry,
  RecurringInvoice,
  EmailLog,
  PaymentReminder,
  TaxRate,
  InvoiceStatus,
  RecurringInterval,
} from '@prisma/client';

// Custom types that aren't in Prisma
export type Currency = 'USD' | 'EUR' | 'GBP' | string;

// Re-export LineItem as a more convenient name
export type LineItem = {
  id?: string;
  description: string;
  quantity: number;
  rate: number; // Stored in minor units (cents)
  taxRate?: number; // Percentage (e.g., 20 for 20%)
  amount?: number; // Calculated: quantity * rate
  taxAmount?: number; // Calculated: amount * (taxRate / 100)
  total?: number; // Calculated: amount + taxAmount
};

// Form input types (for use in forms before saving to database)
export interface InvoiceFormData {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  currency: Currency;
  lineItems: Omit<LineItem, 'id'>[];
  notes?: string;
  terms?: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  notes?: string;
}

export interface TimeEntryFormData {
  clientId?: string;
  date: string;
  hours: number;
  description: string;
  rate: number;
  isBillable: boolean;
}

// Settings types
export interface UserSettings {
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyLogo?: string;
  defaultCurrency: Currency;
  defaultTaxRate: number;
  invoiceNumberPrefix: string;
  invoiceNumberSuffix: string;
  nextInvoiceNumber: number;
  dateFormat: string;
  emailSignature?: string;
}

// Utility types for populated relations
export interface InvoiceWithRelations extends Invoice {
  client: Client;
  lineItems: InvoiceLineItem[];
  user: User;
}

export interface InvoiceWithLineItems extends Invoice {
  lineItems: InvoiceLineItem[];
  client: Client;
}

export interface TimeEntryWithRelations extends TimeEntry {
  client?: Client | null;
  user: User;
}

export interface ClientWithInvoices extends Client {
  invoices: Invoice[];
}

// Type guards
export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return ['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(value);
}

export function isRecurringInterval(value: string): value is RecurringInterval {
  return ['weekly', 'monthly', 'quarterly', 'yearly'].includes(value);
}