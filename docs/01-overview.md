# Project Overview

## What is This Project?

This is an **Intelligent Request Management System** built as a ChatGPT-like interface. It combines:

- **AI Chat Interface** - A beautiful, ChatGPT-style UI for conversations
- **Web Scraping** - Intelligent scraping using Playwright to extract data from websites
- **Request Management** - Structured forms to collect and process business requests
- **AI Integration** - Real-time AI responses using Groq API

## Core Purpose

The application helps users:
1. Create structured requests with specific business information (item details, CR rates, customer expectations)
2. Automatically evaluate items using AI
3. Scrape websites for additional information
4. Have intelligent conversations with context-aware AI

## Technology Stack

- **Framework**: Next.js 14 (React-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (built on Radix UI)
- **AI**: Groq API (Llama 3.1 models)
- **Scraping**: Playwright (headless Chromium)
- **State Management**: React Hooks (useState, useEffect)

## Key Files to Know

- `app/page.tsx` - Main application page (the brain of the app)
- `components/request-form.tsx` - Form for collecting request information
- `app/api/chat/route.ts` - API endpoint for AI conversations
- `app/api/scrape/route.ts` - API endpoint for web scraping
- `lib/playwright-scraper.ts` - Core scraping logic

## Next Steps

Read the following documentation in order:
1. [Architecture Overview](./02-architecture.md) - How everything fits together
2. [Project Structure](./03-project-structure.md) - File organization
3. [Data Flow](./04-data-flow.md) - How data moves through the app
4. [Components Guide](./05-components.md) - Understanding the UI pieces
6. [API Routes](./06-api-routes.md) - Backend endpoints
