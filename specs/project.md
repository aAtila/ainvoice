# Project Name

**AInvoice**

## Project Description

AInvoice is a free, minimalist, responsive web invoicing app for freelancers who find mainstream accounting suites bloated. It lets users **create, send, and track invoices** with smart defaults, recurring schedules, late-payment reminders, and a lightweight **manual time-tracking** add-on. Everything runs in the browser—no native builds or monetization in v1.

## Target Audience

- Solo freelancers & micro-business owners (design, development, consulting, content, etc.)
- Issue 1 – 50 invoices per month
- Need only basic bookkeeping; prefer clutter-free tools

## Desired Features

### Core Invoicing

- [ ] Create invoice

  - [ ] Multi-line items: description, quantity, rate, optional tax per line
  - [ ] Auto-increment invoice numbers (customizable prefix/suffix)

- [ ] Generate PDF (single clean template; optional logo)
- [ ] Email invoice with attached PDF & open-tracking

### Clients & Contacts

- [ ] Lightweight client database

  - [ ] Name, email, address, tax/VAT ID
  - [ ] Quick-add from invoice form

### Taxes & Currencies

- [ ] User-defined currencies (default set in Settings)
- [ ] User-defined tax rates (0 %, 20 %, custom)
- [ ] Automatic tax totals

### Recurring & Automation

- [ ] Recurring invoices (weekly / monthly / custom)
- [ ] Late-payment reminders (email X days after due date)

### Time Tracking (Manual Entry)

- [ ] Lightweight “Add Time” modal from dashboard

  - [ ] Date, hours, memo, billable rate
  - [ ] Convert selected entries into invoice line items

### Reporting & Export

- [ ] Income summary (monthly / quarterly)
- [ ] CSV export of invoices & payments
- [ ] **Single consolidated PDF export** (all invoices stitched into one file)

### Account & Settings

- [ ] Email + password authentication
- [ ] Locale preferences (date & number formatting)
- [ ] GDPR basics: data export & delete account

## Design Requests

- [ ] Clean, distraction-free UI built with **TailwindCSS**

  - [ ] Light & dark mode

- [ ] Mobile-first responsive layout
- [ ] WCAG AA color contrast

## Other Notes

- Tech stack: React / Next.js (App Router) frontend, serverless backend (Supabase / Firebase)
- No online payments, accounting-package integrations, or offline PWA in v1
- Target MVP delivery: within 3 months of project start
- Future roadmap: expenses module, real-time timer, native wrappers, Peppol e-invoicing

**Potential Technical Challenges / Decisions**

- Currency precision: store amounts in minor units (integers) to avoid rounding errors
- PDF rendering: choose headless Chromium vs. server-side renderer early
- Recurring jobs: serverless scheduler or cron-style queue worker
- Time-entry → invoice: UX for selecting entries and preventing double-billing
- GDPR: implement export/delete endpoints from day one
