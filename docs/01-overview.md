# Project Overview

## What is This Project?

This is an **Intelligent Request Management System** with automated web scraping capabilities. It combines:

- **AI Chat Interface** - A ChatGPT-style UI for conversations
- **Automated Web Scraping** - Intelligent scraping using Playwright to extract data from websites
- **Request Management** - Structured forms to collect and process business requests
- **AI Integration** - Dual AI system: conversational AI (Groq) and tooling AI for structured tasks
- **Smart Search Automation** - Automatically searches uk.webuy.com with AI-generated search terms

## Core Purpose

The application helps users:
1. Create structured requests with specific business information (item details, CR rates, customer expectations)
2. **Automatically search uk.webuy.com** - When a request is submitted, the system:
   - Generates an optimized search term using AI
   - Navigates to uk.webuy.com
   - Fills in the search field automatically
   - Extracts and displays results (links, images, text)
3. Have intelligent conversations with context-aware AI
4. View real-time progress through a collapsible thinking panel

## Technology Stack

- **Framework**: Next.js 14 (React-based, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (built on Radix UI)
- **AI**: Groq API (Llama 3.1 models)
  - Conversational AI: `/api/chat` - For user conversations
  - Tooling AI: `/api/ai-tooling` - For structured tasks (search term generation)
- **Scraping**: Playwright (headless Chromium with UK browser context)
- **State Management**: React Hooks (useState, useEffect)

## Key Features

### 1. Automated Webuy.com Search
- Automatically triggers when a request form is submitted
- Uses AI to generate optimal search terms from user input
- Fills search forms automatically
- Extracts and displays comprehensive results

### 2. Thinking Panel UI
- Real-time progress display in a collapsible panel
- Shows step-by-step progress (like ChatGPT's thinking mode)
- Stays visible after completion for reference
- All progress and results in a single message

### 3. Dual AI System
- **Conversational AI** (`/api/chat`) - For natural language conversations
- **Tooling AI** (`/api/ai-tooling`) - For structured, concise responses (search terms, data extraction)

### 4. Browser Context Configuration
- UK-based browser context (en-GB locale, Europe/London timezone)
- Realistic user agent (Chrome 131 on Windows)
- 1920x1080 viewport for consistent rendering

## Key Files to Know

- `app/page.tsx` - Main application page (orchestrates all functionality)
- `components/request-form.tsx` - Form for collecting request information
- `components/chat-message.tsx` - Message display with thinking panel support
- `app/api/chat/route.ts` - API endpoint for AI conversations
- `app/api/ai-tooling/route.ts` - API endpoint for AI tooling tasks
- `app/api/scrape/route.ts` - API endpoint for web scraping
- `lib/playwright-scraper.ts` - Core scraping logic with browser context

## Next Steps

Read the following documentation in order:
1. [Architecture Overview](./02-architecture.md) - How everything fits together
2. [Project Structure](./03-project-structure.md) - File organization
3. [Data Flow](./04-data-flow.md) - How data moves through the app
4. [Components Guide](./05-components.md) - Understanding the UI pieces
5. [API Routes](./06-api-routes.md) - Backend endpoints
6. [Key Features](./07-key-features.md) - Detailed feature explanations
