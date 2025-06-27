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

- [ ] Step 3: Data modelling & Prisma migrations

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

- [ ] Step 4: Authentication pages and middleware

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

- [ ] Step 5: Main application layout and navigation
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

## Core UI Components

- [ ] Step 6: Base UI components library

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

- [ ] Step 7: Form components and validation
  - **Task**: Create form handling components with validation using react-hook-form and zod
  - **Files**:
    - `package.json`: Add react-hook-form, zod, @hookform/resolvers
    - `src/components/ui/Form.tsx`: Form wrapper components
    - `src/lib/validations.ts`: Zod schemas for forms
    - `src/hooks/useForm.ts`: Custom form hook
    - `src/components/ui/ErrorMessage.tsx`: Error display component
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

## Client Management

- [ ] Step 8: Client database operations

  - **Task**: Create server actions and hooks for client CRUD operations
  - **Files**:
    - `src/lib/actions/clients.ts`: Server actions for client operations
    - `src/hooks/useClients.ts`: Client data fetching hooks
    - `src/lib/validations/client.ts`: Client form validation schemas
  - **Step Dependencies**: Step 7
  - **User Instructions**: None

- [ ] Step 9: Client management pages
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

## Invoice Core Features

- [ ] Step 10: Invoice data operations

  - **Task**: Create server actions and hooks for invoice CRUD operations
  - **Files**:
    - `src/lib/actions/invoices.ts`: Server actions for invoice operations
    - `src/hooks/useInvoices.ts`: Invoice data fetching hooks
    - `src/lib/validations/invoice.ts`: Invoice form validation schemas
    - `src/lib/invoice-utils.ts`: Invoice calculation utilities
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

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
