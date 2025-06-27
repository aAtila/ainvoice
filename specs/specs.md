# Implementation Plan

## Project Setup & Infrastructure

- [x] Step 1: Update project metadata and basic configuration

  - **Task**: Update package.json metadata, layout title/description, and create basic project structure with types and utilities
  - **Files**:
    - `package.json`: Update name, description, and add initial dependencies
    - `src/app/layout.tsx`: Update metadata for AInvoice app
    - `src/lib/types.ts`: Create core TypeScript interfaces for Invoice, Client, etc.
    - `src/lib/utils.ts`: Create utility functions for currency formatting, date handling
    - `src/lib/constants.ts`: Define app constants like default currencies, tax rates
  - **Step Dependencies**: None
  - **User Instructions**: None

- [x] Step 2: Install and configure **Prisma with SQLite**

  - **Task**: Add Prisma, initialise the project with a _local_ SQLite
    datasource, generate the Prisma client, and set up environment
    variables.
  - **Files**:
    - `package.json`: Add `prisma` (dev) and `@prisma/client` (runtime)
      dependencies
    - `prisma/schema.prisma`: Base Prisma schema with a SQLite
      datasource
    - `.env`: Define `DATABASE_URL="file:./data.db"`
    - `src/lib/prisma.ts`: Helper that exports a singleton
      `PrismaClient` instance resilient to Next.js hot-reloading
  - **Step Dependencies**: Step 1
  - **User Instructions**:
    1. Run `npx prisma init --datasource-provider sqlite` to scaffold
       the Prisma folder and `.env`.
    2. Execute `npx prisma migrate dev --name init` to create the first
       migration and generate the client.
    3. Restart the dev server so TypeScript picks up the generated
       types.

- [x] Step 3: Data modelling & Prisma migrations

  - **Task**: Define Prisma models for users, clients, invoices, and
    time entries, then apply and seed the database.
  - **Files**:
    - `prisma/schema.prisma`: Add complete data models with relations
      and enums
    - `prisma/seed.ts`: Seed script run via `prisma db seed` to insert
      demo data (e.g.\ default tax rates, currencies)
    - `src/lib/types.ts`: (update) Re-export core TypeScript types
      inferred from `@prisma/client`
  - **Step Dependencies**: Step 2
  - **User Instructions**:
    1. Extend `prisma/schema.prisma` with the required models.
    2. Run `npx prisma migrate dev --name add_core_models` to create
       the migration and regenerate the client.
    3. Execute `npx prisma db seed` to populate the database with
       initial values.

## Authentication & Core Layout

- [x] Step 4: Authentication pages and middleware

  - **Task**: Create login, signup, and password reset pages with Supabase Auth integration
  - **Files**:
    - `src/app/(auth)/login/page.tsx`: Login page component
    - `src/app/(auth)/signup/page.tsx`: Signup page component
    - `src/app/(auth)/reset-password/page.tsx`: Password reset page
    - `src/app/(auth)/layout.tsx`: Auth layout wrapper
    - `src/middleware.ts`: Route protection middleware
    - `src/components/auth/AuthForm.tsx`: Reusable auth form component
  - **Step Dependencies**: Step 3
  - **User Instructions**: Configure Supabase Auth settings (redirect URLs, email templates)
  - **Review**: 
    - Implemented JWT-based authentication using existing Prisma User model instead of Supabase
    - Added dependencies: bcryptjs, jsonwebtoken, cookies-next, zod
    - Created auth utilities in `src/lib/auth.ts` for password hashing, JWT management, and cookie handling
    - API routes handle login, signup, logout, and current user retrieval
    - Middleware protects routes and redirects based on auth status
    - Auth pages feature clean, centered design with dark mode support
    - Demo credentials: demo@ainvoice.com / demo123
    - Additional files created:
      - `.env.local` for JWT_SECRET
      - `src/contexts/AuthContext.tsx` for future client-side auth state management
      - `.eslintrc.json` to exclude generated Prisma files
    - Updated files:
      - `src/app/page.tsx` - Protected dashboard with user info
      - `prisma/seed.ts` - Uses bcrypt for password hashing
      - `next.config.ts` - ESLint configuration
    - Added Prisma Studio npm script for database inspection

- [x] Step 5: Main application layout and navigation
  - **Task**: Create authenticated app layout with sidebar navigation, header, and theme toggle
  - **Files**:
    - `src/app/(dashboard)/layout.tsx`: Main dashboard layout
    - `src/components/layout/Sidebar.tsx`: Navigation sidebar component
    - `src/components/layout/Header.tsx`: Top header with user menu
    - `src/components/ui/ThemeToggle.tsx`: Dark/light mode toggle
    - `src/lib/theme.ts`: Theme management utilities
    - `src/app/globals.css`: Update with theme variables and dark mode styles
  - **Step Dependencies**: Step 4
  - **User Instructions**: None
  - **Review**:
    - Implemented a professional dashboard layout with sidebar and header components
    - Added dependency: @heroicons/react for UI icons
    - Created dashboard layout in `src/app/(dashboard)/layout.tsx` that:
      - Protects routes by checking authentication
      - Provides two-column layout with sidebar and main content area
      - Passes user data to Header component
    - Sidebar component features:
      - Navigation links for Dashboard, Invoices, Clients, Time Tracking, Reports, Settings
      - Active state highlighting based on current route
      - Mobile-responsive with hamburger menu and overlay
      - Smooth transitions and dark mode support
    - Header component includes:
      - User information display (name and email)
      - Dropdown menu with Profile, Settings, and Sign Out options
      - Theme toggle integration
      - Click-outside handling for dropdown
    - Theme system implementation:
      - ThemeToggle component with sun/moon icons
      - Persists theme preference to localStorage
      - Detects system preference as fallback
      - Script in root layout prevents flash of unstyled content
      - Added `suppressHydrationWarning` to html element
    - Updated global styles with:
      - CSS variables for colors, spacing, shadows, and border radius
      - Dark mode color scheme that inverts the color hierarchy
      - Smooth transitions for theme switching
      - Custom scrollbar styling
      - Focus and selection styles
    - Updated dashboard page (`src/app/page.tsx`):
      - Removed duplicate layout elements (now handled by dashboard layout)
      - Added stats grid showing Total Revenue, Active Invoices, Total Clients, Time Tracked
      - Added Recent Activity section placeholder
      - Clean, card-based design with dark mode support

## Core UI Components

- [x] Step 6: Base UI components library

  - **Task**: Create reusable UI components following design system principles
  - **Files**:
    - `src/components/ui/Button.tsx`: Button component with variants
    - `src/components/ui/Input.tsx`: Form input component
    - `src/components/ui/Select.tsx`: Select dropdown component
    - `src/components/ui/Modal.tsx`: Modal dialog component
    - `src/components/ui/Card.tsx`: Card container component
    - `src/components/ui/Badge.tsx`: Status badge component
    - `src/components/ui/Table.tsx`: Data table component
    - `src/lib/cn.ts`: Class name utility function
  - **Step Dependencies**: Step 5
  - **User Instructions**: None
  - **Review**:
    - Installed dependencies: clsx and tailwind-merge for className utilities
    - Created `cn` utility function that combines clsx and tailwind-merge for safe class merging
    - **Button component** features:
      - 5 variants: primary, secondary, outline, ghost, danger
      - 3 sizes: sm, md, lg
      - Loading state with spinner animation
      - Full width option
      - Proper disabled states and keyboard navigation
      - Uses forwardRef for flexibility
    - **Input component** includes:
      - Label, error message, and hint text support
      - Prefix and suffix slots for icons or text
      - 3 sizes matching Button component
      - Error state styling with red borders
      - Dark mode compatible with focus states
    - **Select component** provides:
      - Native select with custom styling
      - Consistent design with Input component
      - Custom arrow icon
      - Placeholder support
      - Error state handling
    - **Modal component** features:
      - Backdrop with configurable click-to-close
      - Smooth fade and zoom animations
      - 3 sizes: sm, md, lg
      - Keyboard escape to close
      - Focus trap implementation
      - Body scroll lock when open
      - Accessible with ARIA attributes
    - **Card component** includes:
      - Optional header and footer sections
      - Hoverable state for interactive cards
      - Convenience subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
      - Flexible padding options
    - **Badge component** provides:
      - 5 variants: default, success, warning, error, info
      - 2 sizes: sm, md
      - Optional dot indicator
      - Semantic colors for status indication
    - **Table component** features:
      - Responsive with horizontal scroll
      - Striped rows option
      - Sortable column headers (visual indicators)
      - Hover states on rows
      - Empty state component
      - Subcomponents: Table, TableHeader, TableBody, TableRow, TableHead, TableCell
    - All components are:
      - Fully typed with TypeScript
      - Dark mode compatible using CSS variables
      - Accessible with proper ARIA attributes
      - Using consistent naming conventions
      - Following the project's design system

- [x] Step 7: Form components and validation
  - **Task**: Create form handling components with validation using react-hook-form and zod
  - **Files**:
    - `package.json`: Add react-hook-form, zod, @hookform/resolvers
    - `src/components/ui/Form.tsx`: Form wrapper components
    - `src/lib/validations.ts`: Zod schemas for forms
    - `src/hooks/useForm.ts`: Custom form hook
    - `src/components/ui/ErrorMessage.tsx`: Error display component
  - **Step Dependencies**: Step 6
  - **User Instructions**: None
  - **Review**:
    - Installed dependencies: react-hook-form, zod, and @hookform/resolvers
    - **Form wrapper components** (`src/components/ui/Form.tsx`):
      - Created context-based form components that integrate with react-hook-form
      - Components: Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
      - Full TypeScript support with generic types
      - Automatic ID generation and ARIA attributes for accessibility
      - FormLabel supports required field indicator
      - useFormField hook for accessing form field context
    - **Validation schemas** (`src/lib/validations.ts`):
      - Common patterns: email, password, phone, URL, currency, percentage
      - Date validations: past, future, and standard date
      - Pre-built schemas: login, signup, forgot password, reset password
      - Helper schemas: address, pagination, search
      - Utility functions: makeSchemaOptional and pickFromSchema for schema manipulation
      - All schemas include proper error messages
    - **Custom useForm hook** (`src/hooks/useForm.ts`):
      - Wrapper around react-hook-form's useForm
      - Automatic Zod resolver integration when schema is provided
      - Built-in loading state management (isSubmitting)
      - Error handling with submitError state
      - Async form submission support
      - Type helper InferFormData for schema type inference
    - **ErrorMessage component** (`src/components/ui/ErrorMessage.tsx`):
      - Displays form errors with consistent styling
      - Optional icon display with ExclamationCircleIcon
      - Smooth fade-in animation
      - ARIA attributes for accessibility (role="alert", aria-live="polite")
      - FieldError convenience component for form field errors
      - Dark mode compatible
    - All components follow the project's design system and are ready for use in client, invoice, and settings forms

## Client Management

- [x] Step 8: Client database operations

  - **Task**: Create server actions and hooks for client CRUD operations
  - **Files**:
    - `src/lib/actions/clients.ts`: Server actions for client operations
    - `src/hooks/useClients.ts`: Client data fetching hooks
    - `src/lib/validations/client.ts`: Client form validation schemas
  - **Step Dependencies**: Step 7
  - **User Instructions**: None
  - **Review**:
    - Installed dependency: swr for data fetching and caching
    - **Client validation schemas** (`src/lib/validations/client.ts`):
      - `clientSchema` - Base schema with all client fields
      - `createClientSchema` - Schema for creating new clients
      - `updateClientSchema` - Schema for updates (all fields optional)
      - `clientFilterSchema` - Schema for search/filter parameters
      - `clientSearchSchema` - Schema for autocomplete search
      - Validates email format, phone numbers, postal codes
      - Type exports for TypeScript integration
    - **Server actions** (`src/lib/actions/clients.ts`):
      - `createClient` - Creates new client with duplicate email check
      - `updateClient` - Updates client with ownership verification
      - `deleteClient` - Deletes client (prevents if has invoices)
      - `getClient` - Fetches single client with related data
      - `getClients` - Lists clients with pagination, filtering, and sorting
      - `searchClients` - Quick search for autocomplete
      - `getClientStats` - Aggregates client statistics
      - All actions include:
        - User authentication checks
        - Proper error handling with user-friendly messages
        - Path revalidation for Next.js caching
        - Prisma type safety
    - **Client hooks** (`src/hooks/useClients.ts`):
      - `useClients` - List clients with pagination and filters
      - `useClient` - Fetch single client details
      - `useClientStats` - Get client revenue and hours statistics
      - `useClientSearch` - Debounced search for autocomplete
      - `useCreateClient` - Handle client creation with loading states
      - `useUpdateClient` - Handle updates with optimistic UI
      - `useDeleteClient` - Handle deletion with cache invalidation
      - Features:
        - SWR for intelligent caching and revalidation
        - Optimistic updates for instant UI feedback
        - Proper error handling and loading states
        - Type-safe with full TypeScript support
    - **Supporting utilities**:
      - Created `useDebounce` hook for search input debouncing
      - Comprehensive error messages for better UX
      - Pagination with offset-based approach
      - Case-insensitive search across multiple fields
    - Security features:
      - All queries scoped to authenticated user
      - Ownership verification before updates/deletes
      - Protection against deleting clients with invoices
      - Input validation with Zod schemas

- [x] Step 9: Client management pages
  - **Task**: Create client list, add/edit client pages with responsive design
  - **Files**:
    - `src/app/(dashboard)/clients/page.tsx`: Client list page
    - `src/app/(dashboard)/clients/new/page.tsx`: Add new client page
    - `src/app/(dashboard)/clients/[id]/page.tsx`: Edit client page
    - `src/components/clients/ClientForm.tsx`: Client form component
    - `src/components/clients/ClientList.tsx`: Client list component
    - `src/components/clients/ClientCard.tsx`: Individual client card
  - **Step Dependencies**: Step 8
  - **User Instructions**: None
  - **Review**:
    - **Client List Page** (`src/app/(dashboard)/clients/page.tsx`):
      - Search bar with real-time filtering
      - Filter dropdowns for city and state (prepared for dynamic data)
      - Sort options: name, email, created date, updated date
      - Toggle between table and grid views
      - Pagination with page size of 20
      - "Add Client" button in header
      - Responsive layout with mobile-friendly controls
    - **Add New Client Page** (`src/app/(dashboard)/clients/new/page.tsx`):
      - Breadcrumb navigation
      - Back button to return to list
      - Error handling with user-friendly messages
      - Success redirect to client list
      - Loading state during submission
    - **Edit Client Page** (`src/app/(dashboard)/clients/[id]/page.tsx`):
      - Breadcrumb with client name
      - Client statistics cards: Total Invoices, Total Revenue, Paid Revenue, Total Hours
      - Recent invoices list with status badges
      - Delete button with protection for clients with invoices
      - Confirmation modal for deletion
      - Loading skeleton during data fetch
      - Error handling with fallback UI
    - **ClientForm Component** (`src/components/clients/ClientForm.tsx`):
      - Reusable form for create and edit operations
      - Three sections: Basic Information, Address Information, Additional Information
      - Field validation with inline error messages
      - Pre-populated data for edit mode
      - Responsive grid layout for form fields
      - Cancel and submit buttons with loading states
    - **ClientList Component** (`src/components/clients/ClientList.tsx`):
      - Table view with sortable columns
      - Grid view with ClientCard components
      - Loading skeleton animation
      - Empty state with CTA
      - Dropdown menu for row actions (Edit, Delete)
      - Delete confirmation modal
      - Protection against deleting clients with invoices
    - **ClientCard Component** (`src/components/clients/ClientCard.tsx`):
      - Displays client name, email, phone, location
      - Shows invoice and time entry counts
      - "New" badge for clients without activity
      - Edit and delete action buttons
      - Hover effect for better interactivity
      - Click card to edit functionality
    - **Key Features Implemented**:
      - Full CRUD operations with optimistic UI
      - Real-time search and filtering
      - Responsive design with mobile-first approach
      - Loading states and error boundaries
      - Data integrity protection (no deletion of clients with invoices)
      - Consistent UI patterns across all pages
      - Accessibility with ARIA labels and keyboard navigation

## Invoice Core Features

- [x] Step 10: Invoice data operations

  - **Task**: Create server actions and hooks for invoice CRUD operations
  - **Files**:
    - `src/lib/actions/invoices.ts`: Server actions for invoice operations
    - `src/hooks/useInvoices.ts`: Invoice data fetching hooks
    - `src/lib/validations/invoice.ts`: Invoice form validation schemas
    - `src/lib/invoice-utils.ts`: Invoice calculation utilities
  - **Step Dependencies**: Step 8
  - **User Instructions**: None
  - **Review**:
    - Implemented comprehensive invoice data operations following the same patterns as client management
    - **Validation schemas** (`src/lib/validations/invoice.ts`):
      - Created Zod schemas for line items, invoice creation, updates, filtering, and search
      - Added validation for status transitions and date relationships
      - Enforces business rules like minimum line items and valid tax rates
    - **Calculation utilities** (`src/lib/invoice-utils.ts`):
      - Pure functions for amount/tax calculations using integer math (minor units)
      - Invoice number generation with customizable prefix/suffix
      - Status computation based on dates and payment status
      - Helper functions for UI display and business logic checks
    - **Server actions** (`src/lib/actions/invoices.ts`):
      - Full CRUD operations with user authentication and ownership verification
      - Atomic invoice number generation using Prisma transactions
      - Advanced filtering with search, status, client, and date range
      - Statistics aggregation for dashboard display
      - Special actions: mark as paid, duplicate invoice
      - Proper error handling with user-friendly messages
    - **SWR hooks** (`src/hooks/useInvoices.ts`):
      - React hooks for all invoice operations with optimistic updates
      - Cache invalidation strategies for data consistency
      - Search with debouncing for better UX
      - Loading and error states for all mutations
    - **Type updates**:
      - Added `InvoiceWithLineItems` type to `src/lib/types.ts`
    - **Key architectural decisions**:
      - Store all monetary values in minor units (cents) to avoid floating-point issues
      - Use database transactions for invoice number generation to prevent duplicates
      - Implement status transition validation to maintain data integrity
      - Follow established patterns from client management for consistency

- [ ] Step 11: Invoice creation and editing

  - **Task**: Create invoice form with line items, tax calculations, and client selection
  - **Files**:
    - `src/app/(dashboard)/invoices/new/page.tsx`: Create invoice page
    - `src/app/(dashboard)/invoices/[id]/edit/page.tsx`: Edit invoice page
    - `src/components/invoices/InvoiceForm.tsx`: Main invoice form component
    - `src/components/invoices/LineItemsTable.tsx`: Line items management
    - `src/components/invoices/InvoiceSummary.tsx`: Invoice totals summary
    - `src/components/invoices/ClientSelector.tsx`: Client selection component
  - **Step Dependencies**: Step 10
  - **User Instructions**: None

- [ ] Step 12: Invoice list and dashboard
  - **Task**: Create invoice listing page and main dashboard with overview stats
  - **Files**:
    - `src/app/(dashboard)/page.tsx`: Main dashboard page
    - `src/app/(dashboard)/invoices/page.tsx`: Invoice list page
    - `src/components/invoices/InvoiceList.tsx`: Invoice list component
    - `src/components/invoices/InvoiceCard.tsx`: Individual invoice card
    - `src/components/dashboard/StatsCards.tsx`: Dashboard statistics
    - `src/components/dashboard/RecentInvoices.tsx`: Recent invoices widget
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

## PDF Generation & Email

- [ ] Step 13: PDF generation setup

  - **Task**: Set up PDF generation using Puppeteer or similar, create invoice template
  - **Files**:
    - `package.json`: Add PDF generation dependencies (puppeteer or @react-pdf/renderer)
    - `src/lib/pdf-generator.ts`: PDF generation utilities
    - `src/components/invoices/InvoicePDFTemplate.tsx`: PDF template component
    - `src/app/api/invoices/[id]/pdf/route.ts`: PDF generation API endpoint
  - **Step Dependencies**: Step 12
  - **User Instructions**: None

- [ ] Step 14: Email integration
  - **Task**: Set up email sending with Resend or similar service for invoice delivery
  - **Files**:
    - `package.json`: Add email service dependency (resend or nodemailer)
    - `src/lib/email.ts`: Email sending utilities
    - `src/lib/email-templates.ts`: Email templates
    - `src/app/api/invoices/[id]/send/route.ts`: Email sending API endpoint
    - `src/components/invoices/SendInvoiceModal.tsx`: Send invoice modal
  - **Step Dependencies**: Step 13
  - **User Instructions**: Set up email service account (Resend/SendGrid), configure environment variables

## Settings & Configuration

- [ ] Step 15: User settings and preferences

  - **Task**: Create settings page for user preferences, currencies, tax rates, and company info
  - **Files**:
    - `src/app/(dashboard)/settings/page.tsx`: Settings page
    - `src/components/settings/CompanySettings.tsx`: Company information form
    - `src/components/settings/CurrencySettings.tsx`: Currency preferences
    - `src/components/settings/TaxSettings.tsx`: Tax rate configuration
    - `src/lib/actions/settings.ts`: Settings server actions
    - `src/hooks/useSettings.ts`: Settings data hooks
  - **Step Dependencies**: Step 14
  - **User Instructions**: None

- [ ] Step 16: Invoice numbering and templates
  - **Task**: Implement auto-increment invoice numbers and customizable invoice templates
  - **Files**:
    - `src/lib/invoice-numbering.ts`: Invoice number generation logic
    - `src/components/settings/InvoiceSettings.tsx`: Invoice preferences form
    - `src/components/invoices/LogoUpload.tsx`: Company logo upload component
    - `src/app/api/upload/logo/route.ts`: Logo upload API endpoint
  - **Step Dependencies**: Step 15
  - **User Instructions**: Configure Supabase Storage bucket for file uploads

## Time Tracking

- [ ] Step 17: Time tracking data operations

  - **Task**: Create time entry CRUD operations and conversion to invoice line items
  - **Files**:
    - `src/lib/actions/time-entries.ts`: Time entry server actions
    - `src/hooks/useTimeEntries.ts`: Time entry data hooks
    - `src/lib/validations/time-entry.ts`: Time entry validation schemas
    - `src/lib/time-utils.ts`: Time calculation utilities
  - **Step Dependencies**: Step 16
  - **User Instructions**: None

- [ ] Step 18: Time tracking interface
  - **Task**: Create time tracking pages and components for manual time entry
  - **Files**:
    - `src/app/(dashboard)/time/page.tsx`: Time tracking page
    - `src/components/time/TimeEntryForm.tsx`: Time entry form
    - `src/components/time/TimeEntryList.tsx`: Time entries list
    - `src/components/time/TimeToInvoiceModal.tsx`: Convert time to invoice modal
    - `src/components/invoices/TimeEntrySelector.tsx`: Time entry selection for invoices
  - **Step Dependencies**: Step 17
  - **User Instructions**: None

## Recurring Invoices & Automation

- [ ] Step 19: Recurring invoice setup

  - **Task**: Create recurring invoice configuration and scheduling logic
  - **Files**:
    - `src/lib/actions/recurring-invoices.ts`: Recurring invoice server actions
    - `src/components/invoices/RecurringSettings.tsx`: Recurring invoice settings
    - `src/lib/recurring-utils.ts`: Recurring schedule calculations
    - `src/app/api/cron/recurring-invoices/route.ts`: Cron job for generating recurring invoices
  - **Step Dependencies**: Step 18
  - **User Instructions**: Set up Vercel Cron Jobs or similar for recurring invoice generation

- [ ] Step 20: Payment reminders and tracking
  - **Task**: Implement payment status tracking and automated reminder emails
  - **Files**:
    - `src/components/invoices/PaymentStatus.tsx`: Payment status component
    - `src/lib/payment-reminders.ts`: Payment reminder logic
    - `src/app/api/cron/payment-reminders/route.ts`: Cron job for payment reminders
    - `src/components/invoices/MarkAsPaidModal.tsx`: Mark invoice as paid modal
  - **Step Dependencies**: Step 19
  - **User Instructions**: Configure cron job for payment reminders

## Reporting & Export

- [ ] Step 21: Reporting dashboard

  - **Task**: Create income summaries, charts, and financial reporting
  - **Files**:
    - `package.json`: Add charting library (recharts or chart.js)
    - `src/app/(dashboard)/reports/page.tsx`: Reports page
    - `src/components/reports/IncomeChart.tsx`: Income visualization
    - `src/components/reports/InvoiceStats.tsx`: Invoice statistics
    - `src/lib/reports.ts`: Report calculation utilities
  - **Step Dependencies**: Step 20
  - **User Instructions**: None

- [ ] Step 22: Data export functionality
  - **Task**: Implement CSV export and consolidated PDF export features
  - **Files**:
    - `src/lib/export-utils.ts`: Export utilities for CSV and PDF
    - `src/app/api/export/csv/route.ts`: CSV export API endpoint
    - `src/app/api/export/pdf-consolidated/route.ts`: Consolidated PDF export
    - `src/components/reports/ExportButtons.tsx`: Export action buttons
  - **Step Dependencies**: Step 21
  - **User Instructions**: None

## GDPR & Data Management

- [ ] Step 23: GDPR compliance features
  - **Task**: Implement data export and account deletion functionality
  - **Files**:
    - `src/app/(dashboard)/settings/privacy/page.tsx`: Privacy settings page
    - `src/lib/actions/gdpr.ts`: GDPR compliance server actions
    - `src/app/api/user/export-data/route.ts`: User data export API
    - `src/app/api/user/delete-account/route.ts`: Account deletion API
    - `src/components/settings/DataManagement.tsx`: Data management component
  - **Step Dependencies**: Step 22
  - **User Instructions**: None

## Polish & Optimization

- [ ] Step 24: Mobile responsiveness and accessibility

  - **Task**: Ensure all components are mobile-responsive and meet WCAG AA standards
  - **Files**:
    - `src/app/globals.css`: Mobile-specific styles and accessibility improvements
    - `src/components/ui/SkipLink.tsx`: Skip navigation link
    - `src/lib/accessibility.ts`: Accessibility utilities
    - Update all existing components for mobile responsiveness
  - **Step Dependencies**: Step 23
  - **User Instructions**: Test with screen readers and mobile devices

- [ ] Step 25: Error handling and loading states

  - **Task**: Add comprehensive error handling, loading states, and user feedback
  - **Files**:
    - `src/app/error.tsx`: Global error boundary
    - `src/app/loading.tsx`: Global loading component
    - `src/components/ui/LoadingSpinner.tsx`: Loading spinner component
    - `src/components/ui/ErrorBoundary.tsx`: Error boundary component
    - `src/lib/error-handling.ts`: Error handling utilities
    - `src/hooks/useToast.ts`: Toast notification hook
  - **Step Dependencies**: Step 24
  - **User Instructions**: None

- [ ] Step 26: Performance optimization and final polish
  - **Task**: Optimize performance, add meta tags, and final UI polish
  - **Files**:
    - `src/app/layout.tsx`: Add proper meta tags and SEO
    - `src/lib/seo.ts`: SEO utilities
    - `next.config.ts`: Performance optimizations
    - `src/app/sitemap.ts`: Generate sitemap
    - `src/app/robots.txt`: Robots.txt file
  - **Step Dependencies**: Step 25
  - **User Instructions**: Test application thoroughly, deploy to production
