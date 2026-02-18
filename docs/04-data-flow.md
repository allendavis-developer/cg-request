# Data Flow

## How Data Moves Through the Application

This document explains the complete journey of data from user input to results display.

## Flow 1: Creating a New Request with Automatic Webuy Search

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
       │ Adds user message with request info:
       │ "Request Information:
       │  - Item Information: ...
       │  - CR Rate: ...
       │  - Type: ...
       │  - Customer Expectation: ...
       │
       │  User Request: What is this item worth?"
       │
       ▼
┌─────────────────────┐
│ Auto-Trigger        │
│ handleWebuySearch() │
│ (Automatic)         │
└──────┬──────────────┘
       │
       │ Creates thinking message with:
       │ isThinking: true
       │ thinkingSteps: []
       │
       ▼
┌─────────────────────┐
│ Step 1: Generate   │
│ Search Term         │
│ POST /api/ai-tooling│
│ task: "generate_search_term"│
└──────┬──────────────┘
       │
       │ Updates thinking message:
       │ thinkingSteps: ["Generating search term..."]
       │
       ▼
┌─────────────────────┐
│ Step 2: Navigate    │
│ POST /api/scrape    │
│ url: "uk.webuy.com" │
│ waitForSelector: "#predictiveSearchText"│
│ fillForm: [{...}]   │
└──────┬──────────────┘
       │
       │ Updates thinking message:
       │ thinkingSteps: [
       │   "Generating search term...",
       │   "Generated search term: 'iPhone 15'",
       │   "Navigating to uk.webuy.com...",
       │   "Typing 'iPhone 15' into search field..."
       │ ]
       │
       ▼
┌─────────────────────┐
│ Step 3: Extract    │
│ Results             │
│ - Text content      │
│ - Links            │
│ - Images           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Final Update        │
│ isThinking: false   │
│ content: "Successfully searched..."│
│ scrapeResult: {...} │
│ thinkingSteps: [all steps]│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ UI Renders          │
│ - Thinking panel    │
│   (collapsible)     │
│ - Content message   │
│ - Scrape results    │
│   (links, images)   │
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
       │ Checks message type:
       │
       ├─── URL? ────► handleScrape() (Flow 3)
       │
       ├─── Webuy search? ────► handleWebuySearch() (Flow 1)
       │
       └─── Regular ──►
              │
              │ Adds user message to state
              │ (includes request context if available)
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

## Flow 3: Manual Web Scraping (URL Detection)

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
       │ Gets browser context (UK settings)
       │ Creates new page
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

## Thinking Panel Flow

The thinking panel is a special UI component that shows real-time progress:

```
┌─────────────────────┐
│ Message Created     │
│ isThinking: true   │
│ thinkingSteps: []   │
└──────┬──────────────┘
       │
       │ Progress updates:
       │
       ▼
┌─────────────────────┐
│ Update 1            │
│ thinkingSteps: [    │
│   "Step 1..."      │
│ ]                   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Update 2            │
│ thinkingSteps: [    │
│   "Step 1...",      │
│   "Step 2..."       │
│ ]                   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Final Update        │
│ isThinking: false   │
│ thinkingSteps: [all]│
│ content: "Result..."│
│ scrapeResult: {...} │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ UI Renders          │
│ - Collapsible panel │
│   (shows "Processed")│
│ - All steps visible │
│ - Content below     │
│ - Results below     │
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

When sending messages, request data is automatically included in the user message:

```typescript
let userMessageContent = content
if (currentConv?.requestData) {
  userMessageContent = `Request Information:
- Item Information: ${currentConv.requestData.itemInformation}
- CR Rate: ${currentConv.requestData.crRate}
- Type: ${currentConv.requestData.type.toUpperCase()}
- Customer Expectation: ${currentConv.requestData.customerExpectation}

User Request: ${content}`
}
```

This gives the AI full context about the request in every conversation.

## Message Structure

Messages can have different states:

```typescript
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  scrapeResult?: any
  isThinking?: boolean        // Currently processing
  thinkingSteps?: string[]    // Progress steps
}
```

- **User messages**: Always have content, may include request context
- **Thinking messages**: `isThinking: true`, `thinkingSteps` updates in real-time
- **Completed messages**: `isThinking: false`, `thinkingSteps` preserved, may have `scrapeResult`

See [Components Guide](./05-components.md) for component-level details.
