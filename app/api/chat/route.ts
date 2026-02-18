import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, model = 'llama-3.1-8b-instant' } = body

    // Available Groq models:
    // - llama-3.1-8b-instant (fast, recommended)
    // - llama-3.1-70b-versatile (deprecated, use llama-3.3-70b-versatile if needed)
    // - mixtral-8x7b-32768
    // - gemma-7b-it

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured. Get a free API key at https://console.groq.com' },
        { status: 500 }
      )
    }

    // Format messages for Groq
    const chatMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: model,
      temperature: 0.7,
      max_tokens: 2048,
    })

    const response = completion.choices[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      content: response,
      model: completion.model,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
