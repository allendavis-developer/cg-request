# ChatGPT UI Clone with Intelligent Scraper

A 1:1 recreation of the ChatGPT UI with integrated Playwright-based web scraping capabilities. Use it as an intelligent scraper that can extract content from websites directly through the chat interface.

## Features

- ✅ Sidebar with conversation history
- ✅ Chat interface with message bubbles
- ✅ Model selector dropdown
- ✅ Message actions (copy, like/dislike)
- ✅ Typing indicator
- ✅ Responsive design (mobile & desktop)
- ✅ Dark theme matching ChatGPT
- ✅ **Intelligent Web Scraping with Playwright**
  - Automatic URL detection
  - Extract text, links, and images
  - Custom selector extraction
  - Screenshot support
  - Beautiful result display

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Scraping Websites

Simply paste a URL in the chat input, or use the scrape command:

- **Automatic**: Just paste a URL like `https://example.com`
- **Explicit command**: Type `scrape https://example.com` or `/scrape https://example.com`

The scraper will automatically:
- Extract all text content
- Find all links
- Extract image URLs
- Display results in a formatted view

### Example Commands

```
https://example.com
scrape https://news.ycombinator.com
/scrape https://github.com
```

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn-ui** - UI components
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons
- **Playwright** - Web scraping and automation

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── scrape/
│   │   │   └── route.ts      # Single URL scraping API
│   │   └── scrape-multiple/
│   │       └── route.ts      # Multiple URLs scraping API
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main chat page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn-ui components
│   ├── sidebar.tsx           # Conversation sidebar
│   ├── chat-message.tsx      # Message component
│   ├── chat-input.tsx        # Input area
│   ├── model-selector.tsx    # Model dropdown
│   └── scrape-result.tsx     # Scraping results display
└── lib/
    ├── utils.ts              # Utility functions
    └── playwright-scraper.ts # Playwright scraper logic
```

## API Endpoints

### POST `/api/scrape`

Scrape a single URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "extractText": true,
  "extractLinks": true,
  "extractImages": true,
  "screenshot": false,
  "selectors": [".article", ".title"],
  "waitForSelector": ".content",
  "customScript": "return document.title"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  "text": "Extracted text content...",
  "links": ["https://...", "https://..."],
  "images": ["https://...", "https://..."],
  "metadata": { ... }
}
```

### POST `/api/scrape-multiple`

Scrape multiple URLs at once.

**Request Body:**
```json
{
  "urls": ["https://example.com", "https://example.org"],
  "extractText": true,
  "extractLinks": true
}
```

## AI Integration

This app uses **Groq API** for AI responses - it's free, super fast, and perfect for development!

### Quick Setup:
1. Get free API key: [https://console.groq.com](https://console.groq.com)
2. Create `.env.local` file:
   ```
   GROQ_API_KEY=your_api_key_here
   ```
3. Restart dev server

See `AI_SETUP.md` for detailed instructions.

## Notes

- Playwright runs in headless mode by default
- Scraping results are displayed inline in the chat
- The UI matches ChatGPT's design as closely as possible
- Fully responsive with mobile support
- All scraping happens server-side via API routes
- AI responses use Groq API (free tier available)
