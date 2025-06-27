// Utility functions for AInvoice

import { LineItem, Currency } from './types';

/**
 * Format a number as currency
 * @param amount - Amount in minor units (cents)
 * @param currency - Currency code
 * @param locale - Locale for formatting (defaults to en-US)
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'USD',
  locale: string = 'en-US'
): string {
  // Convert from minor units to major units
  const majorAmount = amount / 100;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorAmount);
}

/**
 * Convert major currency units to minor units (e.g., dollars to cents)
 * @param amount - Amount in major units
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert minor currency units to major units (e.g., cents to dollars)
 * @param amount - Amount in minor units
 */
export function toMajorUnits(amount: number): number {
  return amount / 100;
}

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param locale - Locale for formatting (defaults to en-US)
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 * @param date - Date to format
 */
export function formatISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}

/**
 * Calculate due date based on payment terms
 * @param invoiceDate - Invoice date
 * @param daysUntilDue - Number of days until payment is due (default 30)
 */
export function calculateDueDate(invoiceDate: Date | string, daysUntilDue: number = 30): Date {
  const date = typeof invoiceDate === 'string' ? new Date(invoiceDate) : new Date(invoiceDate);
  date.setDate(date.getDate() + daysUntilDue);
  return date;
}

/**
 * Calculate the subtotal for line items (before tax)
 * @param lineItems - Array of line items
 */
export function calculateSubtotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    const amount = item.quantity * item.rate;
    return sum + amount;
  }, 0);
}

/**
 * Calculate the tax amount for a line item
 * @param amount - Base amount in minor units
 * @param taxRate - Tax rate as a percentage (e.g., 20 for 20%)
 */
export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100));
}

/**
 * Calculate the total tax for all line items
 * @param lineItems - Array of line items
 */
export function calculateTaxTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    if (!item.taxRate) return sum;
    const amount = item.quantity * item.rate;
    const tax = calculateTax(amount, item.taxRate);
    return sum + tax;
  }, 0);
}

/**
 * Calculate the total amount (subtotal + tax)
 * @param lineItems - Array of line items
 */
export function calculateTotal(lineItems: LineItem[]): number {
  const subtotal = calculateSubtotal(lineItems);
  const taxTotal = calculateTaxTotal(lineItems);
  return subtotal + taxTotal;
}

/**
 * Generate a unique invoice number
 * @param prefix - Invoice number prefix
 * @param number - Sequential number
 * @param suffix - Invoice number suffix
 */
export function generateInvoiceNumber(
  number: number,
  prefix: string = 'INV-',
  suffix: string = ''
): string {
  const paddedNumber = number.toString().padStart(4, '0');
  return `${prefix}${paddedNumber}${suffix}`;
}

/**
 * Check if an invoice is overdue
 * @param dueDate - Invoice due date
 * @param paidAt - Payment date (if paid)
 */
export function isOverdue(dueDate: Date | string, paidAt?: Date | string): boolean {
  if (paidAt) return false;
  
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day
  due.setHours(0, 0, 0, 0);
  
  return now > due;
}

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format a phone number for display
 * @param phone - Phone number to format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original for other formats
  return phone;
}

/**
 * Validate email address
 * @param email - Email to validate
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append when truncated (default: '...')
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Get initials from a name
 * @param name - Full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}