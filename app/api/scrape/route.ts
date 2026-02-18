import { NextRequest, NextResponse } from 'next/server'
import { getScraper } from '@/lib/playwright-scraper'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      url,
      selectors,
      waitForSelector,
      waitForTimeout,
      screenshot,
      extractText,
      extractLinks,
      extractImages,
      customScript,
      fillForm,
    } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const scraper = getScraper()
    const result = await scraper.scrape({
      url,
      selectors,
      waitForSelector,
      waitForTimeout,
      screenshot,
      extractText: extractText !== false,
      extractLinks,
      extractImages,
      customScript,
      fillForm,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scraping failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Playwright Scraper API',
    endpoints: {
      POST: '/api/scrape - Scrape a single URL',
    },
  })
}
