# Components Guide

## Component Architecture

All components are in the `components/` directory. They follow React best practices:
- Functional components with hooks
- TypeScript interfaces for props
- Reusable and composable

## UI Components (`components/ui/`)

These are **base components** from shadcn-ui. They're building blocks used by other components.

### `button.tsx`
**Purpose**: Styled button with variants
**Used by**: Almost every component
**Variants**: default, destructive, outline, secondary, ghost, link
**Example**:
```tsx
<Button variant="ghost" size="sm">Click me</Button>
```

### `input.tsx`
**Purpose**: Text input field
**Used by**: `request-form.tsx`, `chat-input.tsx`
**Features**: Styled, accessible, supports all HTML input attributes

### `label.tsx`
**Purpose**: Form label (accessible)
**Used by**: `request-form.tsx`
**Features**: Links to inputs via `htmlFor` attribute

### `switch.tsx`
**Purpose**: Toggle switch (on/off)
**Used by**: `request-form.tsx` (for BB/DP toggle)
**Features**: Accessible, animated

### `dropdown-menu.tsx`
**Purpose**: Dropdown menu component
**Used by**: `model-selector.tsx`
**Features**: Keyboard navigation, accessible

### `scroll-area.tsx`
**Purpose**: Custom scrollable container
**Used by**: `sidebar.tsx`, main messages area
**Features**: Styled scrollbars, smooth scrolling

## Feature Components

### `sidebar.tsx`
**Purpose**: Left sidebar with conversation list
**Location**: `components/sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}
```

**Features**:
- Lists all conversations
- Highlights current conversation
- Delete button on hover
- Responsive (hides on mobile)
- "New request" button at top

**State**: Uses local state for hover effects

### `request-form.tsx`
**Purpose**: Form to collect request information
**Location**: `components/request-form.tsx`

**Props**:
```typescript
interface RequestFormProps {
  onSubmit: (data: RequestData) => void
}
```

**Fields**:
1. **Item Information** - Text input
2. **CR Rate** - Number input
3. **Type** - Switch (BB/DP)
4. **Customer Expectation** - Text input

**Features**:
- Full-screen layout
- Form validation (all fields required)
- Submit button disabled until all fields filled
- Large, accessible inputs

**Data Structure**:
```typescript
interface RequestData {
  itemInformation: string
  crRate: string
  type: "bb" | "dp"
  customerExpectation: string
}
```

### `chat-message.tsx`
**Purpose**: Display individual messages with thinking panel support
**Location**: `components/chat-message.tsx`

**Props**:
```typescript
interface ChatMessageProps {
  message: Message
}
```

**Features**:
- Different styling for user vs assistant
- User: Purple avatar, left-aligned
- Assistant: Green avatar, left-aligned
- **Thinking Panel**: Collapsible progress display
- Action buttons (copy, like/dislike) on hover
- Copy to clipboard functionality
- Integrated scraping results display

**Message Structure**:
```typescript
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  scrapeResult?: any          // Optional scraping data
  isThinking?: boolean        // Currently processing
  thinkingSteps?: string[]    // Progress steps
}
```

**Thinking Panel**:
- Shows when `thinkingSteps` exists and has items
- Collapsible header ("Processing..." or "Processed")
- Displays all progress steps with bullet points
- Stays visible after completion
- Design matches app's dark theme

### `chat-input.tsx`
**Purpose**: Message input area
**Location**: `components/chat-input.tsx`

**Props**:
```typescript
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}
```

**Features**:
- Auto-resizing textarea
- Enter to send, Shift+Enter for new line
- Send button (disabled when empty)
- Placeholder text
- Styled like ChatGPT input

### `model-selector.tsx`
**Purpose**: Dropdown to select AI model
**Location**: `components/model-selector.tsx`

**Props**:
```typescript
interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onSelectModel: (modelId: string) => void
}
```

**Features**:
- Dropdown menu
- Shows current selection
- Model descriptions

### `scrape-result.tsx`
**Purpose**: Display scraping results
**Location**: `components/scrape-result.tsx`

**Props**:
```typescript
interface ScrapeResultProps {
  result: ScrapeResult
}
```

**Displays**:
- Success/error status
- Page title and URL
- Extracted text (truncated if long)
- Links list (first 20, scrollable)
- Images grid (first 16, responsive)
- Screenshot (if available)
- Custom metadata

**Features**:
- Formatted cards for each section
- Scrollable content areas
- Clickable links and images
- Error handling display
- Integrated into chat messages
- Shows within same message as thinking panel

## Component Communication

Components communicate through **props** (parent to child) and **callbacks** (child to parent):

```
app/page.tsx (Parent)
    │
    ├── Sidebar
    │   └── Calls: onNewConversation()
    │
    ├── RequestForm
    │   └── Calls: onSubmit(requestData)
    │
    ├── ChatInput
    │   └── Calls: onSend(message)
    │
    └── ChatMessage
        └── Receives: message (read-only)
```

## Styling

All components use:
- **Tailwind CSS** - Utility classes
- **Dark theme** - ChatGPT-like colors
- **Responsive** - Mobile-friendly
- **Consistent spacing** - Using Tailwind scale

Color scheme:
- Background: `#171717` (dark gray)
- Messages: `#212121` (slightly lighter)
- Input: `#40414f` (medium gray)
- Accent: `#10A37F` (green, like ChatGPT)

See [API Routes](./06-api-routes.md) for backend components.
