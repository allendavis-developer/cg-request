# Project Structure

## Directory Layout

```
cg-request/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Backend)
│   │   ├── chat/          # AI chat endpoint
│   │   ├── scrape/        # Single URL scraping
│   │   └── scrape-multiple/ # Multiple URLs scraping
│   ├── layout.tsx         # Root layout (wraps all pages)
│   ├── page.tsx           # Main page (the app!)
│   └── globals.css        # Global styles
│
├── components/             # React Components
│   ├── ui/                # shadcn-ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── ...
│   ├── sidebar.tsx        # Left sidebar with conversations
│   ├── chat-message.tsx   # Individual message display
│   ├── chat-input.tsx     # Message input area
│   ├── request-form.tsx   # Request information form
│   ├── model-selector.tsx # AI model dropdown
│   └── scrape-result.tsx  # Scraping results display
│
├── lib/                   # Utility Libraries
│   ├── utils.ts           # Helper functions (cn, etc.)
│   └── playwright-scraper.ts # Scraping logic
│
├── docs/                  # Documentation (you are here!)
│
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── next.config.js         # Next.js configuration
```

## Key Files Explained

### `app/page.tsx`
**The Main Application**
- Contains all the main logic
- Manages conversations, messages, and UI state
- Handles form submissions, message sending, scraping
- **598 lines** - This is the "brain" of the app

**Key Functions:**
- `handleNewConversation()` - Shows request form
- `handleRequestFormSubmit()` - Creates conversation with request data
- `handleSendMessage()` - Sends messages to AI or triggers scraping
- `handleScrape()` - Calls scraping API

### `components/request-form.tsx`
**Request Information Form**
- Collects: Item Information, CR Rate, Type (BB/DP), Customer Expectation
- Full-screen form that appears when creating new request
- Validates all fields before submission

### `components/sidebar.tsx`
**Left Sidebar**
- Lists all conversations
- "New request" button
- Delete conversation functionality
- Responsive (hides on mobile)

### `components/chat-message.tsx`
**Message Display**
- Shows user and assistant messages
- Different styling for each role
- Action buttons (copy, like/dislike) for assistant messages

### `app/api/chat/route.ts`
**AI Chat API Endpoint**
- Receives messages from frontend
- Calls Groq API with conversation history
- Returns AI response
- Handles errors gracefully

### `app/api/scrape/route.ts`
**Web Scraping API Endpoint**
- Receives URL to scrape
- Uses Playwright to load page
- Extracts: text, links, images
- Returns structured data

### `lib/playwright-scraper.ts`
**Scraping Engine**
- Singleton pattern (one browser instance)
- Handles page navigation
- Extracts content using selectors
- Manages browser lifecycle

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `chat-message.tsx`)
- **API Routes**: `route.ts` (Next.js convention)
- **Utilities**: `kebab-case.ts` (e.g., `playwright-scraper.ts`)
- **Config Files**: `kebab-case.config.js` or `.json`

## Import Paths

The project uses **TypeScript path aliases**:

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

The `@/` prefix maps to the project root (configured in `tsconfig.json`).

## Configuration Files

- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS theme and plugins
- `next.config.js` - Next.js build configuration
- `components.json` - shadcn-ui component configuration

See [Data Flow](./04-data-flow.md) to understand how these files work together.
