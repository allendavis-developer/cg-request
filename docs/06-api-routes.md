# API Routes

## Overview

API routes are in `app/api/`. They run on the **server** (Node.js), not in the browser. This is where external services are called.

## Route Structure

Next.js uses the file system for routing:
- `app/api/chat/route.ts` → `/api/chat`
- `app/api/ai-tooling/route.ts` → `/api/ai-tooling`
- `app/api/scrape/route.ts` → `/api/scrape`
- `app/api/scrape-multiple/route.ts` → `/api/scrape-multiple`

## `/api/chat` - AI Chat Endpoint

**File**: `app/api/chat/route.ts`

**Purpose**: Handle AI conversation requests (conversational AI)

**Method**: `POST`

**Request Body**:
```typescript
{
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>
  model?: string  // Default: "llama-3.1-8b-instant"
}
```

**Response**:
```typescript
{
  content: string        // AI response text
  model: string          // Model used
  usage: {               // Token usage
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

**Error Response**:
```typescript
{
  error: string
}
```

**Flow**:
1. Validates request (checks for messages array)
2. Checks for `GROQ_API_KEY` environment variable
3. Formats messages for Groq API
4. Calls Groq SDK: `groq.chat.completions.create()`
5. Returns response or error

**Configuration**:
- `runtime = 'nodejs'` - Runs on Node.js (required for Groq SDK)
- `maxDuration = 30` - 30 second timeout
- `temperature = 0.7` - For conversational responses

## `/api/ai-tooling` - AI Tooling Endpoint

**File**: `app/api/ai-tooling/route.ts`

**Purpose**: Handle structured AI tasks (separate from conversational AI)

**Method**: `POST`

**Request Body**:
```typescript
{
  task: string           // Task type (e.g., "generate_search_term")
  input: string         // Input for the task
  context?: string       // Optional context
}
```

**Response**:
```typescript
{
  success: boolean
  result: string         // Task result
  task: string           // Task that was performed
  usage: {               // Token usage
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

**Supported Tasks**:
- `generate_search_term` - Converts user requests into effective search terms for e-commerce sites

**Flow**:
1. Validates task type
2. Checks for `GROQ_API_KEY` environment variable
3. Builds task-specific prompt
4. Calls Groq API with lower temperature (0.3) for consistent responses
5. Returns structured result

**Configuration**:
- `runtime = 'nodejs'`
- `maxDuration = 30`
- `temperature = 0.3` - Lower temperature for structured, consistent responses
- `max_tokens = 100` - Short responses for tooling

**Example Usage**:
```typescript
const response = await fetch("/api/ai-tooling", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    task: "generate_search_term",
    input: "iPhone 15 Pro Max 256GB",
    context: "Item Information: iPhone 15 Pro Max..."
  })
})
```

## `/api/scrape` - Single URL Scraping

**File**: `app/api/scrape/route.ts`

**Purpose**: Scrape a single website

**Method**: `POST`

**Request Body**:
```typescript
{
  url: string                    // Required
  extractText?: boolean          // Default: true
  extractLinks?: boolean         // Default: false
  extractImages?: boolean        // Default: false
  screenshot?: boolean           // Default: false
  selectors?: string[]           // Custom CSS selectors
  waitForSelector?: string       // Wait for element before scraping
  waitForTimeout?: number        // Max wait time (ms)
  customScript?: string          // JavaScript to run on page
  fillForm?: Array<{             // Fill form inputs
    selector: string
    value: string
    triggerChange?: boolean
  }>
}
```

**Response**:
```typescript
{
  success: boolean
  url: string
  title?: string
  text?: string
  links?: string[]
  images?: string[]
  screenshot?: string           // Base64 encoded
  metadata?: Record<string, any>
  error?: string
}
```

**Flow**:
1. Validates URL
2. Gets scraper instance (singleton)
3. Calls `scraper.scrape(options)` with browser context
4. Returns results

**Browser Context**:
The scraper uses a UK-based browser context:
- Viewport: 1920x1080
- User Agent: Chrome 131 on Windows
- Locale: en-GB
- Timezone: Europe/London

**Example Usage**:
```typescript
const response = await fetch("/api/scrape", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://uk.webuy.com",
    waitForSelector: "#predictiveSearchText",
    extractText: true,
    extractLinks: true,
    extractImages: true,
    fillForm: [{
      selector: "#predictiveSearchText",
      value: "iPhone 15 Pro",
      triggerChange: true
    }]
  })
})
```

## `/api/scrape-multiple` - Multiple URLs

**File**: `app/api/scrape-multiple/route.ts`

**Purpose**: Scrape multiple URLs in sequence

**Method**: `POST`

**Request Body**:
```typescript
{
  urls: string[]                // Array of URLs
  // ... same options as /api/scrape
}
```

**Response**:
```typescript
{
  results: ScrapeResult[]       // Array of results
}
```

**Flow**:
1. Validates URLs array
2. Scrapes each URL sequentially
3. Returns array of results

## Playwright Scraper Library

**File**: `lib/playwright-scraper.ts`

**Purpose**: Core scraping logic with browser context management

**Class**: `PlaywrightScraper`

**Key Methods**:

### `init()`
Initializes Chromium browser (singleton pattern)
- Only creates browser once
- Reuses for multiple requests

### `getContext()`
Creates browser context with UK settings:
- Viewport: 1920x1080
- User Agent: Chrome 131 on Windows
- Locale: en-GB
- Timezone: Europe/London

### `scrape(options: ScrapeOptions)`
Main scraping method:
1. Gets browser context with UK settings
2. Creates new page from context
3. Navigates to URL
4. Waits for page load
5. Fills form inputs if provided
6. Extracts content based on options
7. Closes page and context
8. Returns results

### `scrapeMultiple(urls: string[], options?)`
Scrapes multiple URLs:
- Calls `scrape()` for each URL
- Returns array of results

### `close()`
Closes browser instance (cleanup)

**Singleton Pattern**:
```typescript
let scraperInstance: PlaywrightScraper | null = null

export function getScraper(): PlaywrightScraper {
  if (!scraperInstance) {
    scraperInstance = new PlaywrightScraper()
  }
  return scraperInstance
}
```

This ensures only one browser instance runs at a time (more efficient).

## Error Handling

All API routes follow this pattern:

```typescript
try {
  // ... logic
  return NextResponse.json(result)
} catch (error: any) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: error.message || 'Failed' },
    { status: 500 }
  )
}
```

## Environment Variables

Required:
- `GROQ_API_KEY` - For AI chat and tooling endpoints

Optional:
- None currently (all config is in code)

## Security Considerations

1. **API Keys**: Stored in environment variables (never in code)
2. **URL Validation**: Basic validation on scrape endpoints
3. **Rate Limiting**: Not implemented (could add if needed)
4. **CORS**: Next.js handles this automatically for same-origin requests
5. **Browser Context**: Uses realistic browser settings to avoid detection

## Testing API Routes

You can test endpoints using:
- Browser DevTools (Network tab)
- curl:
  ```bash
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello"}]}'
  ```
- Postman or similar tools

See [Project Structure](./03-project-structure.md) for file locations.
