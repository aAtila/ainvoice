# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AInvoice is a minimalist web invoicing application for freelancers built with Next.js 15.3.4, React 19, TypeScript, and TailwindCSS v4. The app provides core invoicing features including invoice creation, PDF generation, client management, recurring invoices, manual time tracking, and reporting.

## Commands

### Development
```bash
npm run dev     # Start development server on http://localhost:3000
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Testing
No test framework is currently configured. When implementing tests, update this section with the appropriate commands.

## Architecture

### Tech Stack
- **Frontend**: React 19 with Next.js 15.3.4 (App Router)
- **Styling**: TailwindCSS v4 with PostCSS
- **Language**: TypeScript with strict mode enabled
- **Fonts**: Geist (sans) and Geist Mono

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/specs/` - Project specifications and requirements
- `/public/` - Static assets

### Key Configuration
- **TypeScript**: Path alias `@/*` maps to `./src/*`
- **TailwindCSS**: Using new v4 with `@tailwindcss/postcss` plugin
- **Next.js**: App Router enabled, no custom config yet

## Implementation Guidelines

### Planned Features (from specs/project.md)
1. **Core Invoicing**: Multi-line items, auto-increment numbers, PDF generation, email sending
2. **Client Management**: Lightweight database with contact details
3. **Recurring & Automation**: Weekly/monthly schedules, late-payment reminders
4. **Time Tracking**: Manual entry with conversion to invoice items
5. **Reporting**: Income summaries, CSV exports, consolidated PDF export

### Technical Considerations
- Store currency amounts as integers (minor units) to avoid rounding errors
- Choose PDF rendering approach early (headless Chromium vs server-side)
- Implement GDPR compliance (export/delete) from the start
- Design for mobile-first responsive layout with WCAG AA compliance

### Backend Integration
The project will use serverless backend (Supabase or Firebase) - not yet implemented.

## Development Notes
- This is a fresh Next.js project created with create-next-app
- Currently only the base template exists
- No authentication, database, or API routes implemented yet
- Target MVP delivery within 3 months of project start