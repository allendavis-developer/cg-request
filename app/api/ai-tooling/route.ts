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
        const isSanityCheck = input.sanityCheck === true
        
        if (isSanityCheck) {
          // Sanity check mode: just check if a question is needed
          systemPrompt = `Analyze the filtered products and previous answers to determine if another question is needed.

Check:
1. Do all products have the same price? If yes, return null
2. Can you identify the product without more questions? If yes, return null
3. Would another question be redundant given previous answers? If yes, return null
4. Is there a NEW distinguishing feature that hasn't been asked about? If yes, return "needed"

Return ONLY: {"question": null} if no question needed, OR {"question": "needed"} if a question is needed.`
        } else {
          // Normal mode: generate a question
          systemPrompt = `You are a product refinement assistant. Analyze the product titles and ask questions for clarification if needed.

Return ONLY valid JSON in this exact format:
{
  "question": {
    "id": "question_1",
    "question": "What color is it?",
    "options": [
      {"value": "white", "label": "White"},
      {"value": "midnight-black", "label": "Midnight Black"}
    ]
  }
}

OR if no question is needed:
{
  "question": null
}

Rules:
- Generate ONE question at a time, OR return null if no question needed
- Questions should be based ONLY on what you see in the product titles
- If all products have the same price, you may return null
- Each question should have 2-5 options
- Option values: lowercase, hyphens (e.g., "midnight-black")
- Option labels: proper capitalization (e.g., "Midnight Black")
- Return format: {"question": {...}} OR {"question": null}`
        }

        const products = input.products || input
        const productsJson = JSON.stringify(products, null, 2)
        const previousQuestions = input.previousQuestions || []
        const previousAnswers = input.previousAnswers || {}
        const requestContext = input.requestContext || ''
        
        // Check if all products have the same price
        const prices = products.map((p: any) => p.price).filter((p: any) => p)
        const uniquePrices = [...new Set(prices)]
        const allSamePrice = uniquePrices.length === 1 && prices.length > 0
        
        if (isSanityCheck) {
          // Sanity check: just determine if question is needed
          let contextText = ''
          if (previousQuestions.length > 0) {
            contextText += `\n\nPrevious questions and answers:\n${previousQuestions.map((q: any) => {
              const answer = previousAnswers[q.id]
              const answerLabel = answer ? q.options?.find((o: any) => o.value === answer)?.label : 'Not answered'
              return `- ${q.question} → ${answerLabel || answer || 'Not answered'}`
            }).join('\n')}\n\nCheck if another question would be redundant or unnecessary.`
          }
          
          if (allSamePrice) {
            contextText += `\n\nAll ${prices.length} products have the same price: ${uniquePrices[0]}. You likely don't need another question.`
          } else {
            contextText += `\n\nProducts have ${uniquePrices.length} different prices: ${uniquePrices.join(', ')}. A question may be needed to distinguish them.`
          }
          
          userPrompt = `Given these filtered products (already narrowed by previous answers), determine if another question is needed:

${productsJson}${contextText}

Return {"question": null} if no question needed (all same price, or question would be redundant), or {"question": "needed"} if a question is needed.`
        } else {
          // Normal mode: generate question
          let contextText = ''
          if (previousQuestions.length > 0) {
            contextText += `\n\nPrevious questions asked:\n${previousQuestions.map((q: any) => `- ${q.question}`).join('\n')}\n\nDo not ask similar questions.`
          }
          
          if (requestContext) {
            contextText += `\n\nUser's original request: "${requestContext}"\nDo not ask about features already specified.`
          }
          
          if (allSamePrice) {
            contextText += `\n\nAll products have the same price (${uniquePrices[0]}). You may return null if no question is needed.`
          } else {
            contextText += `\n\nProducts have different prices: ${uniquePrices.join(', ')}`
          }
          
          userPrompt = `Analyze these product titles and ask questions for clarification if needed:

${productsJson}${contextText}

Return ONLY the JSON: {"question": {...}} OR {"question": null}`
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

        // Handle both old format (questions array) and new format (single question or null)
        let question = null
        if (parsedResult.question === null) {
          // Explicitly null - no question needed
          question = null
        } else if (parsedResult.question && typeof parsedResult.question === 'object') {
          // New format: single question object
          question = parsedResult.question
        } else if (parsedResult.questions && Array.isArray(parsedResult.questions) && parsedResult.questions.length > 0) {
          // Old format: array of questions, take the first one
          question = parsedResult.questions[0]
        }

        return NextResponse.json({
          success: true,
          result: question ? { question } : { question: null },
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
