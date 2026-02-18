# API Routes

## Overview

API routes are in `app/api/`. They run on the **server** (Node.js), not in the browser. This is where external services are called.

## Route Structure

Next.js uses the file system for routing:
- `app/api/chat/route.ts` → `/api/chat`
- `app/api/scrape/route.ts` → `/api/scrape`
- `app/api/scrape-multiple/route.ts` → `/api/scrape-multiple`

## `/api/chat` - AI Chat Endpoint

**File**: `app/api/chat/route.ts`

**Purpose**: Handle AI conversation requests

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

**Example Usage**:
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Hello!" }
    ],
    model: "llama-3.1-8b-instant"
  })
})
```

**Configuration**:
- `runtime = 'nodejs'` - Runs on Node.js (required for Groq SDK)
- `maxDuration = 30` - 30 second timeout

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
3. Calls `scraper.scrape(options)`
4. Returns results

**Example Usage**:
```typescript
const response = await fetch("/api/scrape", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://example.com",
    extractText: true,
    extractLinks: true,
    extractImages: true
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

**Purpose**: Core scraping logic

**Class**: `PlaywrightScraper`

**Key Methods**:

### `init()`
Initializes Chromium browser (singleton pattern)
- Only creates browser once
- Reuses for multiple requests

### `scrape(options: ScrapeOptions)`
Main scraping method:
1. Launches new page
2. Navigates to URL
3. Waits for page load
4. Extracts content based on options
5. Closes page
6. Returns results

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
- `GROQ_API_KEY` - For AI chat endpoint

Optional:
- None currently (all config is in code)

## Security Considerations

1. **API Keys**: Stored in environment variables (never in code)
2. **URL Validation**: Basic validation on scrape endpoints
3. **Rate Limiting**: Not implemented (could add if needed)
4. **CORS**: Next.js handles this automatically for same-origin requests

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
