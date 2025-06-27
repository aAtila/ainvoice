import { z } from 'zod';
import { emailSchema, phoneSchema, requiredString, optionalString } from '../validations';

// Base client schema with all fields
export const clientSchema = z.object({
  name: requiredString.min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  address: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: z.string()
    .regex(/^[A-Z0-9\s-]{3,10}$/i, 'Invalid postal code')
    .optional()
    .or(z.literal('')),
  country: optionalString,
  taxId: optionalString,
  notes: optionalString,
});

// Schema for creating a new client
export const createClientSchema = clientSchema;

// Schema for updating a client (all fields optional)
export const updateClientSchema = clientSchema.partial();

// Schema for client filters
export const clientFilterSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  hasInvoices: z.boolean().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// Schema for client search
export const clientSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// Type exports
export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
export type ClientSearch = z.infer<typeof clientSearchSchema>;