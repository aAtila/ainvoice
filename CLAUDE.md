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

## Tool Usage Guidelines

There are three primary tools to always consider using: the RepoPrompt MCP server's tools, the Gemini AI model via the `gemini` CLI (e.g. `<PIPE ADDITIONAL CONTEXT OR FILE CONTENTS HERE> | gemini -p "CORE PROMPT GOES HERE"`), and `ast-grep` via its CLI. Gemini has a 1 million token context window but is limited to highly deterministic tasks due to its fixed 0.0 temperature, and when invoked via `gemini` it is strictly rate limited at _1 request per minute_.

- **Search**: Use the RepoPrompt MCP tool `RepoPrompt:search` (provides structured results and better codebase integration) instead of `grep`. But if `RepoPrompt:search` would be insufficient to search across structural patterns, use `ast-grep`.
- **Token-Efficient Code Understanding**: Use `RepoPrompt:get_codemap` to get code structure without full file contents (especially when the 25K token context window may otherwise get taxed, and to pre-scan and navigate codebases before deeper dives)
- **Batch File Structure Analysis**: Instead of multiple Read commands, use `RepoPrompt:get_codemap` (with array of file names as argument to it) to get all structures in one call with minimal tokens
- **Maintaining Context Across Operations**:
  - Select files for focused work using `RepoPrompt:toggle_file_selection` (checked=true)
  - See all selected files' structures using `RepoPrompt:list_codemaps_for_selection`
  - Read all selected files at once using `RepoPrompt:read_selected_files`
- **Smart Search with Line Context**: Get exact line numbers for targeted reading using `RepoPrompt:search` (`mode=content` and `regex=true`) and then use `Read` with specific line ranges
- **Codebase-Wide Refactoring**: Find all occurrences before renaming using `RepoPrompt:search` (`mode=content`), and verify scope before using Edit tool
- Use `gemini` if the above tools are insufficient AND >25K tokens would be returned in cases like (but not limited to): analyzing very long command output (tests, builds, logs), processing external data or documentation, comparing across multiple repositories, doing deterministic pattern extraction across >25K tokens worth of code, working with very large non-code files (configs, data, logs, other content outside this repository), dependency tree analysis, etc.
- RepoPrompt, Gemini, and ast-grep may also all be used in the same (sub-)task, e.g.:
  - RepoPrompt to identify files → Gemini to analyze their combined content
  - Gemini to find patterns → RepoPrompt and ast-grep to navigate to specific instances
  - Large refactoring requiring both broad analysis and targeted edits
- **After Conversation Compaction**: When conversation history is compacted, consider what context needs rebuilding based on the next task. Tools like RepoPrompt's codemap can efficiently restore structural understanding of relevant files.

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
