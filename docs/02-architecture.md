# Architecture Overview

## High-Level Architecture

This is a **Next.js Full-Stack Application** with a clear separation between:

```
┌─────────────────────────────────────────────────┐
│           CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────┐  │
│  │  React Components (UI)                   │  │
│  │  - Sidebar, Chat Messages, Forms         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↕ HTTP Requests
┌─────────────────────────────────────────────────┐
│           SERVER (Node.js)                      │
│  ┌──────────────────────────────────────────┐  │
│  │  Next.js API Routes                      │  │
│  │  - /api/chat (AI)                        │  │
│  │  - /api/scrape (Web Scraping)            │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  External Services                       │  │
│  │  - Groq API (AI)                         │  │
│  │  - Playwright (Browser Automation)      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Three Main Flows

### 1. Request Flow (New Request)
```
User clicks "New Request"
    ↓
Request Form appears (full screen)
    ↓
User fills: Item Info, CR Rate, Type (BB/DP), Customer Expectation
    ↓
Form submits → Creates conversation
    ↓
System message shows request data
    ↓
Auto-asks AI: "What is this item worth?"
    ↓
AI responds with evaluation
```

### 2. Chat Flow (Regular Messages)
```
User types message
    ↓
Message sent to /api/chat
    ↓
API adds request context (if available)
    ↓
API calls Groq with full conversation history
    ↓
AI response returned
    ↓
Message displayed in chat
```

### 3. Scraping Flow (URL Detection)
```
User pastes URL or types "scrape https://..."
    ↓
System detects URL
    ↓
Message sent to /api/scrape
    ↓
Playwright launches Chromium (headless)
    ↓
Page scraped: text, links, images extracted
    ↓
Results displayed in formatted card
```

## State Management

The app uses **React State** (not Redux or Context API) because:
- State is relatively simple (conversations, messages, UI state)
- All state lives in `app/page.tsx` (main component)
- No need for complex state management

### Key State Variables

Located in `app/page.tsx`:

```typescript
const [conversations, setConversations] = useState<Conversation[]>([])
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
const [showRequestForm, setShowRequestForm] = useState(false)
const [isTyping, setIsTyping] = useState(false)
const [isScraping, setIsScraping] = useState(false)
```

## Component Hierarchy

```
app/page.tsx (Main Page)
├── Sidebar
│   ├── New Request Button
│   ├── Conversation List
│   └── Settings Button
├── Header
│   ├── Title
│   └── Model Selector
├── Messages Area
│   ├── RequestForm (when creating new request)
│   ├── ChatMessage (for each message)
│   └── ScrapeResultDisplay (for scraping results)
└── ChatInput (hidden when form is showing)
```

## Why This Architecture?

1. **Next.js API Routes** - Server-side logic runs on the same server, no separate backend needed
2. **Client-Side State** - Fast UI updates without server round-trips
3. **Component-Based** - Reusable, testable UI pieces
4. **TypeScript** - Type safety catches errors early
5. **Separation of Concerns** - UI, API, and business logic are separate

See [Data Flow](./04-data-flow.md) for detailed flow diagrams.
