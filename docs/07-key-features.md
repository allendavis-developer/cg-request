# Key Features

## Feature Overview

This document explains the main features of the application and how they work.

## 1. Request Management System

### What It Does
Structured collection of business request information before starting a conversation.

### How It Works
1. User clicks "New request" button
2. Full-screen form appears
3. User fills four fields:
   - **Item Information**: Description of the item
   - **CR Rate**: Credit rate (numeric)
   - **Type**: Toggle between BB (Buy Back) or DP (Direct Purchase)
   - **Customer Expectation**: What the customer expects
4. Form validates all fields
5. On submit, creates conversation with request data
6. Automatically asks AI: "What is this item worth?"

### Why It's Useful
- Ensures all necessary information is collected upfront
- Provides context to AI for better responses
- Creates structured data for business processes

**Files Involved**:
- `components/request-form.tsx` - The form component
- `app/page.tsx` - Form submission handler

## 2. AI-Powered Conversations

### What It Does
Real-time AI conversations using Groq API (Llama 3.1 models).

### How It Works
1. User types message
2. Message sent to `/api/chat` endpoint
3. API adds request context (if available)
4. API calls Groq with full conversation history
5. AI response returned and displayed

### Features
- **Context Awareness**: Request data automatically included in every message
- **Conversation History**: AI remembers previous messages in the conversation
- **Fast Responses**: Groq provides 50+ tokens/second
- **Model Selection**: Can switch between models (currently only 8B available)

### Why It's Useful
- Provides intelligent responses about items
- Understands business context
- Maintains conversation flow

**Files Involved**:
- `app/api/chat/route.ts` - API endpoint
- `app/page.tsx` - Message handling

## 3. Intelligent Web Scraping

### What It Does
Automatically scrapes websites to extract information.

### How It Works
1. User pastes URL or types "scrape https://..."
2. System detects URL
3. Message sent to `/api/scrape` endpoint
4. Playwright launches headless Chromium browser
5. Page loaded and content extracted:
   - Text content
   - Links
   - Images
   - Custom selectors
6. Results displayed in formatted card

### Features
- **Automatic Detection**: Recognizes URLs in messages
- **Multiple Formats**: Can extract text, links, images
- **Custom Selectors**: Extract specific elements
- **Screenshot Support**: Can capture page screenshots
- **Error Handling**: Graceful failure with error messages

### Why It's Useful
- Gathers information from external sources
- Provides data for AI analysis
- Automates research tasks

**Files Involved**:
- `app/api/scrape/route.ts` - API endpoint
- `lib/playwright-scraper.ts` - Scraping engine
- `components/scrape-result.tsx` - Results display

## 4. ChatGPT-Style UI

### What It Does
Beautiful, familiar interface that matches ChatGPT's design.

### How It Works
- Dark theme with ChatGPT colors
- Sidebar with conversation history
- Message bubbles with avatars
- Typing indicators
- Smooth animations

### Features
- **Responsive Design**: Works on mobile and desktop
- **Accessible**: Keyboard navigation, screen reader support
- **Fast**: Optimized React rendering
- **Familiar**: Users already know how to use it

### Why It's Useful
- Reduces learning curve
- Professional appearance
- Great user experience

**Files Involved**:
- All components in `components/`
- `app/globals.css` - Global styles

## 5. Conversation Management

### What It Does
Manages multiple conversations with history.

### How It Works
1. Each conversation has unique ID
2. Conversations stored in React state
3. Sidebar lists all conversations
4. Clicking conversation loads it
5. Messages persist during session

### Features
- **Multiple Conversations**: Switch between different requests
- **Delete Conversations**: Remove unwanted conversations
- **Auto-Titles**: Conversations titled based on first message
- **Last Message Preview**: See last message in sidebar

### Why It's Useful
- Organizes multiple requests
- Easy to switch contexts
- Clean interface

**Files Involved**:
- `components/sidebar.tsx` - Conversation list
- `app/page.tsx` - State management

## 6. Message Actions

### What It Does
Actions available on assistant messages.

### How It Works
- Hover over assistant message
- Action buttons appear:
  - **Copy**: Copies message to clipboard
  - **Thumbs Up**: Like the response
  - **Thumbs Down**: Dislike the response

### Features
- **Copy to Clipboard**: One-click copying
- **Feedback**: Like/dislike tracking (stored in component state)
- **Visual Feedback**: Buttons highlight when active

### Why It's Useful
- Easy to share responses
- Collect user feedback
- Improve AI responses over time

**Files Involved**:
- `components/chat-message.tsx` - Message component

## Feature Integration

All features work together:

```
Request Form
    ↓
Creates Conversation
    ↓
Auto-asks AI (with request context)
    ↓
User can continue chatting
    ↓
User can scrape websites
    ↓
All in same conversation thread
```

## Future Enhancements

Potential additions:
- Database persistence (currently in-memory)
- User authentication
- Export conversations
- Advanced scraping options
- Multiple AI providers
- Conversation search

See [Architecture Overview](./02-architecture.md) for how features connect.
