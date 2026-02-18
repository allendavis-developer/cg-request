# AI API Setup - Groq (Free & Super Fast!)

## Quick Setup (2 minutes)

### 1. Get Your Free API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up (it's free, no credit card needed)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy your API key

### 2. Add API Key to Your Project

Create a `.env.local` file in the root of your project:

```bash
GROQ_API_KEY=your_api_key_here
```

**Important:** Never commit this file to git! It's already in `.gitignore`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Restart Your Dev Server

```bash
npm run dev
```

That's it! Your ChatGPT UI now uses real AI responses.

## Why Groq?

- ✅ **FREE** - Generous free tier (millions of tokens/month)
- ✅ **SUPER FAST** - 50+ tokens/second (fastest inference available)
- ✅ **NO CREDIT CARD** - Just sign up and use
- ✅ **Great Models** - Llama 3.1 8B (fast) and 70B (powerful)

## Available Models

- **Llama 3.1 8B** - Fast, efficient, great for most tasks
- **Llama 3.1 70B** - More capable, slightly slower

You can switch between them using the model selector in the UI.

## Alternative Free Options

If you want to try other APIs:

### Ollama (100% Local, No API Key)
- Run models on your machine
- Completely free, no limits
- Requires more setup

### Together AI
- $5 free credits
- Good pricing after credits

### Google Gemini
- Free tier available
- Good for testing

## Troubleshooting

**Error: "GROQ_API_KEY not configured"**
- Make sure you created `.env.local` (not `.env`)
- Restart your dev server after adding the key
- Check that the key starts with `gsk_`

**Slow responses?**
- Make sure you're using the 8B model for faster responses
- Check your internet connection

**Rate limits?**
- Groq free tier is very generous, but if you hit limits, wait a few minutes
- Consider upgrading if you need more
