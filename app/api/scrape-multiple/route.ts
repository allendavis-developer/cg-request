import { NextRequest, NextResponse } from 'next/server'
import { getScraper } from '@/lib/playwright-scraper'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls, ...options } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    const scraper = getScraper()
    const results = await scraper.scrapeMultiple(urls, options)

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scraping failed' },
      { status: 500 }
    )
  }
}
