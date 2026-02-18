import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * AI Tooling API - Separate from chat API
 * Used for tooling purposes like generating search terms, extracting data, etc.
 * This is optimized for structured, concise responses rather than conversational responses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, input, context } = body

    if (!task) {
      return NextResponse.json(
        { error: 'Task is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured. Get a free API key at https://console.groq.com' },
        { status: 500 }
      )
    }

    let systemPrompt = ''
    let userPrompt = ''

    // Handle different tooling tasks
    switch (task) {
      case 'generate_search_term':
        systemPrompt = `You are a search term generator. Your job is to convert user requests into concise, effective search terms for e-commerce websites. 
- Extract the key product/item information from the user's request
- Create a search term that would be effective for finding that item on a website like CEX/Webuy
- Keep it concise (1-5 words typically)
- Use common product names and model numbers if mentioned
- Return ONLY the search term, nothing else`

        userPrompt = context
          ? `User request: "${input}"\n\nContext: ${context}\n\nGenerate a search term:`
          : `User request: "${input}"\n\nGenerate a search term:`
        break

      default:
        return NextResponse.json(
          { error: `Unknown task: ${task}` },
          { status: 400 }
        )
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant', // Fast model for tooling
      temperature: 0.3, // Lower temperature for more consistent, structured responses
      max_tokens: 100, // Short responses for tooling
    })

    const result = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({
      success: true,
      result,
      task,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('AI Tooling API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process tooling request' },
      { status: 500 }
    )
  }
}
