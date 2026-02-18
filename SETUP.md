# Setup Instructions

## Quick Start

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```
   
   This will download the Chromium browser that Playwright uses for scraping.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use the Scraper

### Method 1: Automatic URL Detection
Simply paste a URL in the chat input:
```
https://example.com
```

### Method 2: Explicit Scrape Command
Use the scrape command:
```
scrape https://example.com
```
or
```
/scrape https://example.com
```

## Features

- **Automatic Content Extraction**: Text, links, and images are automatically extracted
- **Beautiful Results Display**: Scraping results are shown in formatted cards
- **Error Handling**: Failed scrapes show clear error messages
- **Multiple URLs**: Use the API to scrape multiple URLs at once

## Troubleshooting

### Playwright Browser Not Found
If you see errors about missing browsers, run:
```bash
npx playwright install chromium
```

### Port Already in Use
If port 3000 is already in use, Next.js will automatically use the next available port (3001, 3002, etc.)

### Scraping Timeouts
Some websites may take longer to load. The default timeout is 30 seconds. You can modify this in `lib/playwright-scraper.ts`.

## Next Steps

- Customize scraping options in the API routes
- Add more extraction methods
- Implement screenshot capture
- Add data export functionality
