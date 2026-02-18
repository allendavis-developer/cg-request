# Key Features

## 1. Automated Webuy.com Search

### Overview
When a user submits a request form, the system automatically searches uk.webuy.com for the item.

### How It Works

1. **Request Form Submission**
   - User fills out form with item information
   - Form includes: Item Information, CR Rate, Type (BB/DP), Customer Expectation

2. **Automatic Trigger**
   - System detects request context
   - Automatically calls `handleWebuySearch()`
   - No manual action required

3. **AI Search Term Generation**
   - Uses `/api/ai-tooling` endpoint
   - Task: `generate_search_term`
   - Converts user request into optimized search term
   - Example: "iPhone 15 Pro Max 256GB" → "iPhone 15 Pro Max"

4. **Automated Scraping**
   - Navigates to `https://uk.webuy.com`
   - Waits for search input (`#predictiveSearchText`)
   - Fills input with generated search term
   - Triggers input/change events to activate autocomplete
   - Extracts results (text, links, images)

5. **Results Display**
   - All results shown in same message
   - Links displayed in organized list
   - Images shown in grid layout
   - Text content available for review

### Technical Details

- **Browser Context**: UK-based (en-GB locale, Europe/London timezone)
- **User Agent**: Chrome 131 on Windows
- **Viewport**: 1920x1080
- **Form Filling**: Uses Playwright's `fill()` and `dispatchEvent()`

## 2. Thinking Panel UI

### Overview
A collapsible panel that shows real-time progress, similar to ChatGPT's thinking mode.

### Features

- **Real-time Updates**: Progress steps appear as they happen
- **Collapsible**: Can be expanded/collapsed by clicking header
- **Persistent**: Stays visible after completion (shows "Processed" instead of "Processing...")
- **Step History**: All completed steps remain visible
- **Design Consistent**: Matches app's dark theme

### States

1. **Active** (`isThinking: true`)
   - Header shows "Processing..."
   - Steps update in real-time
   - Panel is expanded by default

2. **Completed** (`isThinking: false`)
   - Header shows "Processed"
   - All steps visible (when expanded)
   - Results displayed below

### Implementation

```typescript
interface Message {
  isThinking?: boolean
  thinkingSteps?: string[]
  // ... other fields
}
```

The panel renders when `thinkingSteps` exists and has items.

## 3. Dual AI System

### Overview
Two separate AI endpoints for different purposes.

### Conversational AI (`/api/chat`)

**Purpose**: Natural language conversations

**Characteristics**:
- Higher temperature (0.7) for creative responses
- Longer responses (max 2048 tokens)
- Conversational tone
- Context-aware

**Use Cases**:
- Answering questions
- Providing explanations
- General conversation

### Tooling AI (`/api/ai-tooling`)

**Purpose**: Structured, task-specific responses

**Characteristics**:
- Lower temperature (0.3) for consistency
- Shorter responses (max 100 tokens)
- Task-focused prompts
- Structured output

**Use Cases**:
- Generating search terms
- Extracting data
- Formatting information

### Why Separate?

- **Different Optimization**: Tooling needs consistency, conversation needs creativity
- **Clear Separation**: Easier to maintain and optimize
- **Performance**: Tooling can be faster with shorter responses
- **Cost**: Shorter tooling responses use fewer tokens

## 4. Browser Context Configuration

### Overview
Playwright scraper uses realistic UK browser settings to avoid detection.

### Settings

```typescript
{
  viewport: { width: 1920, height: 1080 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  locale: 'en-GB',
  timezoneId: 'Europe/London',
}
```

### Benefits

- **Realistic**: Appears as real UK user
- **Consistent**: Same settings for all requests
- **Compatible**: Works with UK-based websites
- **Reliable**: Reduces chance of blocking

### Implementation

Each scrape creates a new browser context with these settings, ensuring consistency.

## 5. Request Context Management

### Overview
Request information is automatically included in user messages for AI context.

### How It Works

1. **Form Submission**: Request data stored in conversation
2. **Message Creation**: User message includes request context
3. **AI Processing**: AI receives full context automatically
4. **Persistent**: Context available throughout conversation

### Format

```
Request Information:
- Item Information: iPhone 15 Pro Max 256GB
- CR Rate: 85%
- Type: BB
- Customer Expectation: Good condition, original box

User Request: What is this item worth?
```

### Benefits

- **Context-Aware**: AI understands the full request
- **Automatic**: No manual context injection needed
- **Consistent**: Same format across all messages
- **Complete**: All relevant information included

## 6. Form Input Automation

### Overview
Automatically fills form inputs during scraping.

### Features

- **Selector-Based**: Uses CSS selectors to find inputs
- **Event Triggering**: Dispatches input/change events
- **Wait Support**: Waits for elements before filling
- **Error Handling**: Continues if one field fails

### Implementation

```typescript
fillForm: [{
  selector: "#predictiveSearchText",
  value: "iPhone 15 Pro",
  triggerChange: true
}]
```

### Use Cases

- Search forms
- Login forms (with credentials)
- Multi-step forms
- Dynamic forms (with wait conditions)

## 7. Comprehensive Result Extraction

### Overview
Scraper extracts multiple types of data from pages.

### Extracted Data

1. **Text Content**
   - Main page text
   - Removes scripts/styles
   - Clean, readable format

2. **Links**
   - All anchor tags with href
   - Filtered (removes javascript: links)
   - Absolute URLs

3. **Images**
   - All img tags with src
   - Absolute URLs
   - Displayed in grid

4. **Custom Selectors**
   - Extract specific elements
   - Returns text content
   - Stored in metadata

5. **Screenshots** (optional)
   - Full page screenshots
   - Base64 encoded
   - PNG format

### Display

Results are displayed using `ScrapeResultDisplay` component:
- Organized sections
- Clickable links
- Image grid
- Expandable content

## 8. Message State Management

### Overview
Messages can have different states for different purposes.

### States

1. **User Message**
   - Always has content
   - May include request context
   - Simple display

2. **Thinking Message**
   - `isThinking: true`
   - `thinkingSteps` array
   - Shows progress panel
   - Updates in real-time

3. **Completed Message**
   - `isThinking: false`
   - `thinkingSteps` preserved
   - `content` with result
   - `scrapeResult` (if applicable)

### Benefits

- **Clear States**: Easy to understand message status
- **Progress Tracking**: Users see what's happening
- **History**: Completed steps remain visible
- **Flexibility**: Supports various message types

## Summary

These features work together to create a seamless experience:
1. User submits request → Automatic webuy search
2. Progress shown in thinking panel → Real-time updates
3. AI generates search term → Optimized for e-commerce
4. Scraper fills form → Automated interaction
5. Results displayed → Comprehensive data extraction
6. All in one message → Clean, organized UI
