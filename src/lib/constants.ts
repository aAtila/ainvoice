// Application constants for AInvoice

import { Currency, InvoiceStatus, RecurringInterval } from './types';

// Currency options
export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'MXN', label: 'Mexican Peso', symbol: '$' },
];

// Common tax rates
export const TAX_RATES: { value: number; label: string }[] = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 7, label: '7%' },
  { value: 8, label: '8%' },
  { value: 10, label: '10%' },
  { value: 13, label: '13%' },
  { value: 15, label: '15%' },
  { value: 18, label: '18%' },
  { value: 20, label: '20%' },
  { value: 21, label: '21%' },
  { value: 23, label: '23%' },
  { value: 25, label: '25%' },
];

// Invoice status options
export const INVOICE_STATUSES: { value: InvoiceStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

// Payment terms options (in days)
export const PAYMENT_TERMS: { value: number; label: string }[] = [
  { value: 0, label: 'Due on receipt' },
  { value: 7, label: 'Net 7' },
  { value: 10, label: 'Net 10' },
  { value: 15, label: 'Net 15' },
  { value: 30, label: 'Net 30' },
  { value: 45, label: 'Net 45' },
  { value: 60, label: 'Net 60' },
  { value: 90, label: 'Net 90' },
];

// Recurring interval options
export const RECURRING_INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// Date format options
export const DATE_FORMATS: { value: string; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '31.12.2024' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY', example: 'Dec 31, 2024' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2024' },
];

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD' as Currency,
  TAX_RATE: 0,
  PAYMENT_TERMS: 30,
  INVOICE_PREFIX: 'INV-',
  INVOICE_SUFFIX: '',
  STARTING_INVOICE_NUMBER: 1,
  DATE_FORMAT: 'MM/DD/YYYY',
  ITEMS_PER_PAGE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Email templates
export const EMAIL_TEMPLATES = {
  INVOICE_SUBJECT: 'Invoice {{invoiceNumber}} from {{companyName}}',
  INVOICE_BODY: `Dear {{clientName}},

Please find attached invoice {{invoiceNumber}} for {{invoiceTotal}}.

The payment is due by {{dueDate}}.

Thank you for your business!

Best regards,
{{companyName}}`,
  
  REMINDER_SUBJECT: 'Payment reminder: Invoice {{invoiceNumber}}',
  REMINDER_BODY: `Dear {{clientName}},

This is a friendly reminder that invoice {{invoiceNumber}} for {{invoiceTotal}} is now {{daysOverdue}} days overdue.

Please arrange payment at your earliest convenience.

If you have already sent payment, please disregard this reminder.

Best regards,
{{companyName}}`,
};

// Validation rules
export const VALIDATION = {
  MIN_INVOICE_ITEMS: 1,
  MAX_INVOICE_ITEMS: 100,
  MIN_QUANTITY: 0.01,
  MAX_QUANTITY: 999999,
  MIN_RATE: 0,
  MAX_RATE: 999999999, // In minor units (9,999,999.99 in major units)
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 2000,
  MAX_TERMS_LENGTH: 2000,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
};

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  INVOICES: {
    LIST: '/api/invoices',
    CREATE: '/api/invoices',
    GET: '/api/invoices/[id]',
    UPDATE: '/api/invoices/[id]',
    DELETE: '/api/invoices/[id]',
    SEND: '/api/invoices/[id]/send',
    PDF: '/api/invoices/[id]/pdf',
    DUPLICATE: '/api/invoices/[id]/duplicate',
  },
  CLIENTS: {
    LIST: '/api/clients',
    CREATE: '/api/clients',
    GET: '/api/clients/[id]',
    UPDATE: '/api/clients/[id]',
    DELETE: '/api/clients/[id]',
  },
  TIME_ENTRIES: {
    LIST: '/api/time-entries',
    CREATE: '/api/time-entries',
    GET: '/api/time-entries/[id]',
    UPDATE: '/api/time-entries/[id]',
    DELETE: '/api/time-entries/[id]',
    CONVERT: '/api/time-entries/convert',
  },
  SETTINGS: {
    GET: '/api/settings',
    UPDATE: '/api/settings',
    UPLOAD_LOGO: '/api/settings/logo',
  },
  EXPORT: {
    CSV: '/api/export/csv',
    PDF_CONSOLIDATED: '/api/export/pdf-consolidated',
    USER_DATA: '/api/export/user-data',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  DUPLICATE_EMAIL: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVOICE_NOT_FOUND: 'Invoice not found.',
  CLIENT_NOT_FOUND: 'Client not found.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters.`,
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  INVOICE_CREATED: 'Invoice created successfully.',
  INVOICE_UPDATED: 'Invoice updated successfully.',
  INVOICE_SENT: 'Invoice sent successfully.',
  INVOICE_DELETED: 'Invoice deleted successfully.',
  CLIENT_CREATED: 'Client created successfully.',
  CLIENT_UPDATED: 'Client updated successfully.',
  CLIENT_DELETED: 'Client deleted successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
  PASSWORD_RESET: 'Password reset successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  DATA_EXPORTED: 'Data exported successfully.',
};