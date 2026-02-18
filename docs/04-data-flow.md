# Data Flow

## How Data Moves Through the Application

This document explains the complete journey of data from user input to AI response.

## Flow 1: Creating a New Request

```
┌─────────────┐
│   User      │
│ Clicks      │
│ "New Request"│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ app/page.tsx        │
│ handleNewConversation()│
│ Sets showRequestForm=true│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ RequestForm         │
│ Component Renders   │
│ (Full Screen)       │
└──────┬──────────────┘
       │
       │ User fills form:
       │ - Item Information
       │ - CR Rate
       │ - Type (BB/DP)
       │ - Customer Expectation
       │
       ▼
┌─────────────────────┐
│ Form Submit         │
│ handleRequestFormSubmit()│
└──────┬──────────────┘
       │
       │ Creates Conversation object:
       │ {
       │   id: timestamp,
       │   title: "Request: ...",
       │   requestData: {...}
       │ }
       │
       ▼
┌─────────────────────┐
│ State Update        │
│ setConversations([newConv, ...])│
│ setCurrentConversationId(newConv.id)│
└──────┬──────────────┘
       │
       │ Adds system message with request info
       │ Adds user message: "What is this item worth?"
       │
       ▼
┌─────────────────────┐
│ API Call            │
│ POST /api/chat      │
│ With request context│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ app/api/chat/route.ts│
│ Calls Groq API      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Groq API            │
│ Returns AI Response │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ State Update        │
│ Adds AI message     │
│ to conversation     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ UI Updates          │
│ Message displayed   │
└─────────────────────┘
```

## Flow 2: Sending a Regular Message

```
┌─────────────┐
│   User      │
│ Types Message│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ ChatInput Component│
│ onSubmit()          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ app/page.tsx        │
│ handleSendMessage() │
└──────┬──────────────┘
       │
       │ Checks if URL (scraping)
       │ or regular message
       │
       ├─── URL? ────► Scraping Flow (see Flow 3)
       │
       └─── Regular ──►
              │
              │ Adds user message to state
              │
              ▼
       ┌─────────────────────┐
       │ Build API Messages  │
       │ Includes:           │
       │ - Previous messages │
       │ - Request context   │
       │   (if available)    │
       │ - New user message  │
       └──────┬──────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ POST /api/chat      │
       │ {                   │
       │   messages: [...],  │
       │   model: "..."      │
       │ }                   │
       └──────┬──────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ app/api/chat/route.ts│
       │ Formats for Groq    │
       │ Calls Groq SDK      │
       └──────┬──────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ Groq API            │
       │ Returns response    │
       └──────┬──────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ State Update        │
       │ Adds AI message     │
       └──────┬──────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ UI Renders          │
       │ New message         │
       └─────────────────────┘
```

## Flow 3: Web Scraping

```
┌─────────────┐
│   User      │
│ Pastes URL  │
│ or types    │
│ "scrape ..."│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ app/page.tsx        │
│ isScrapeCommand()   │
│ Detects URL         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ handleScrape()      │
│ POST /api/scrape    │
│ { url: "..." }      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ app/api/scrape/route.ts│
│ Calls getScraper()  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ lib/playwright-scraper.ts│
│ scraper.scrape()    │
└──────┬──────────────┘
       │
       │ Launches Chromium (headless)
       │ Navigates to URL
       │ Waits for page load
       │
       ▼
┌─────────────────────┐
│ Extraction          │
│ - Text content      │
│ - Links            │
│ - Images           │
│ - Custom selectors │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Returns Result      │
│ {                  │
│   success: true,   │
│   text: "...",     │
│   links: [...],    │
│   images: [...]    │
│ }                  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ State Update        │
│ Adds message with   │
│ scrapeResult        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ScrapeResultDisplay │
│ Component Renders   │
│ Formatted results   │
└─────────────────────┘
```

## State Updates Pattern

All state updates follow this pattern:

```typescript
setConversations((prev) =>
  prev.map((conv) => {
    if (conv.id === targetId) {
      return {
        ...conv,
        // Update properties
        messages: [...conv.messages, newMessage],
      }
    }
    return conv
  })
)
```

This ensures:
- ✅ Immutability (doesn't mutate existing state)
- ✅ React detects changes
- ✅ UI re-renders correctly

## Request Context Injection

When sending messages to AI, request data is automatically included:

```typescript
const requestContext = currentConv?.requestData
  ? `Request Context:
- Item Information: ${...}
- CR Rate: ${...}
- Type: ${...}
- Customer Expectation: ${...}
`
  : ""

// Added to user message
content: requestContext + userMessage
```

This gives the AI full context about the request in every conversation.

See [Components Guide](./05-components.md) for component-level details.
