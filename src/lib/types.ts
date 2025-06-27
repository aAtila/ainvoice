// Core type definitions for AInvoice

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type Currency = 'USD' | 'EUR' | 'GBP' | string;

export type RecurringInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  email: string;
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyLogo?: string;
  defaultCurrency?: Currency;
  defaultTaxRate?: number;
  invoiceNumberPrefix?: string;
  invoiceNumberSuffix?: string;
  nextInvoiceNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number; // Stored in minor units (cents)
  taxRate?: number; // Percentage (e.g., 20 for 20%)
  amount?: number; // Calculated: quantity * rate
  taxAmount?: number; // Calculated: amount * (taxRate / 100)
  total?: number; // Calculated: amount + taxAmount
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  client?: Client; // Populated when fetched with relations
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  currency: Currency;
  lineItems: LineItem[];
  subtotal: number; // Sum of all line item amounts (in minor units)
  taxTotal: number; // Sum of all line item tax amounts (in minor units)
  total: number; // subtotal + taxTotal (in minor units)
  notes?: string;
  terms?: string;
  sentAt?: Date;
  paidAt?: Date;
  recurringSchedule?: RecurringSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringSchedule {
  id: string;
  interval: RecurringInterval;
  nextDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  clientId?: string;
  client?: Client;
  date: Date;
  hours: number;
  description: string;
  rate: number; // Hourly rate in minor units
  isBillable: boolean;
  isBilled: boolean;
  invoiceId?: string;
  invoice?: Invoice;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  recipientEmail: string;
  subject: string;
  sentAt: Date;
  openedAt?: Date;
  error?: string;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  scheduledFor: Date;
  sentAt?: Date;
  reminderNumber: number; // 1st reminder, 2nd reminder, etc.
}

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

export interface TaxRate {
  id: string;
  name: string;
  rate: number; // Percentage
  isDefault: boolean;
}