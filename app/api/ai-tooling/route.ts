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

      case 'generate_refinement_questions':
        systemPrompt = `You are a product pricing assistant. You have a list of products with titles and prices, a user's original request, and any previous clarification questions and answers.

Your job: decide if you need ONE more clarification question from the user to determine which price applies to their request.

Return ONLY valid JSON in one of these two formats:

If you need clarification:
{"needsClarification": true, "question": {"id": "q1", "question": "What color is it?", "options": [{"value": "white", "label": "White"}, {"value": "black", "label": "Black"}]}}

If you have enough information:
{"needsClarification": false}

Rules:
- Only ask if genuinely needed to identify the correct price
- ONE question at a time, with 2-6 options based on what exists in the titles
- If all remaining matching products have the same price, return needsClarification: false
- Option values: lowercase with hyphens. Option labels: proper capitalization`

        {
          const products = input.products || []
          const previousQuestions: any[] = input.previousQuestions || []
          const previousAnswers: Record<string, string> = input.previousAnswers || {}
          const requestContext: string = input.requestContext || ''

          const previousQA = previousQuestions.map((q: any) => {
            const answer = previousAnswers[q.id]
            const label = answer ? (q.options?.find((o: any) => o.value === answer)?.label || answer) : 'Not answered'
            return `  Q: ${q.question}\n  A: ${label}`
          }).join('\n')

          userPrompt = `User's request: "${requestContext}"

All products:
${products.map((p: any) => `- "${p.title}" → ${p.price || 'no price'}`).join('\n')}
${previousQA ? `\nPrevious clarifications:\n${previousQA}` : ''}

Do you need one more clarification question to determine the correct price? Return ONLY the JSON.`
        }
        
        // Use higher token limit for this task
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.3,
          max_tokens: 500, // More tokens for structured JSON
        })

        const result = completion.choices[0]?.message?.content?.trim() || '{}'
        let parsedResult
        try {
          // Try to parse directly
          parsedResult = JSON.parse(result)
        } catch (e) {
          // If JSON parsing fails, try to extract JSON from the response
          const jsonMatch = result.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              parsedResult = JSON.parse(jsonMatch[0])
            } catch (e2) {
              parsedResult = { questions: [] }
            }
          } else {
            parsedResult = { questions: [] }
          }
        }

        return NextResponse.json({
          success: true,
          result: {
            needsClarification: parsedResult.needsClarification === true,
            question: parsedResult.needsClarification ? (parsedResult.question || null) : null,
          },
          task,
          usage: completion.usage,
        })

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
