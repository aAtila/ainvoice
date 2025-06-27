import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export const phoneSchema = z
  .string()
  .regex(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/,
    'Invalid phone number'
  )
  .or(z.string().length(0));

export const urlSchema = z
  .string()
  .url('Invalid URL')
  .or(z.string().length(0));

export const currencySchema = z
  .number()
  .min(0, 'Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be between 0 and 100')
  .max(100, 'Percentage must be between 0 and 100');

export const requiredString = z
  .string()
  .min(1, 'This field is required');

export const optionalString = z
  .string()
  .optional()
  .or(z.literal(''));

// Date validations
export const dateSchema = z.coerce.date();

export const futureDateSchema = z.coerce
  .date()
  .refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  });

export const pastDateSchema = z.coerce
  .date()
  .refine((date) => date < new Date(), {
    message: 'Date must be in the past',
  });

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: requiredString,
  email: emailSchema,
  password: simplePasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Address validation
export const addressSchema = z.object({
  street: requiredString,
  city: requiredString,
  state: requiredString,
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
  country: requiredString,
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

// Helper function to make all fields optional in a schema
export function makeSchemaOptional<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  const shape = schema.shape;
  const newShape: z.ZodRawShape = {};
  
  for (const key in shape) {
    newShape[key] = shape[key].optional();
  }
  
  return z.object(newShape);
}

// Helper function to pick fields from a schema
export function pickFromSchema<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  keys: (keyof T['shape'])[]
) {
  const shape = schema.shape;
  const newShape: z.ZodRawShape = {};
  
  for (const key of keys) {
    if (key in shape) {
      newShape[key] = shape[key];
    }
  }
  
  return z.object(newShape);
}