import { chromium, Browser, Page, BrowserContext } from 'playwright'

export interface FormFillAction {
  selector: string
  value: string
  triggerChange?: boolean // Whether to trigger input/change events
}

export interface ScrapeOptions {
  url: string
  selectors?: string[]
  waitForSelector?: string
  waitForTimeout?: number
  screenshot?: boolean
  extractText?: boolean
  extractLinks?: boolean
  extractImages?: boolean
  customScript?: string
  fillForm?: FormFillAction[] // Fill form inputs before scraping
}

export interface ScrapeResult {
  success: boolean
  url: string
  title?: string
  text?: string
  links?: string[]
  images?: string[]
  screenshot?: string
  error?: string
  metadata?: Record<string, any>
}

class PlaywrightScraper {
  private browser: Browser | null = null

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      })
    }
    return this.browser
  }

  async getContext() {
    const browser = await this.init()
    return await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: 'en-GB',
      timezoneId: 'Europe/London',
    })
  }

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    let page: Page | null = null
    let context: BrowserContext | null = null

    try {
      context = await this.getContext()
      page = await context.newPage()

      // Navigate to the URL
      await page.goto(options.url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      const result: ScrapeResult = {
        success: true,
        url: options.url,
        title: await page.title(),
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.waitForTimeout || 10000,
        })
      }

      // Fill form inputs if provided
      if (options.fillForm && options.fillForm.length > 0) {
        for (const fillAction of options.fillForm) {
          try {
            // Wait for the input element to be available
            await page.waitForSelector(fillAction.selector, {
              timeout: options.waitForTimeout || 10000,
            })

            // Fill the input
            await page.fill(fillAction.selector, fillAction.value)

            // Trigger change events if requested
            if (fillAction.triggerChange !== false) {
              await page.dispatchEvent(fillAction.selector, 'input')
              await page.dispatchEvent(fillAction.selector, 'change')
            }

            // Small delay to allow any autocomplete/search to trigger
            await page.waitForTimeout(500)
          } catch (e) {
            console.warn(`Failed to fill form field ${fillAction.selector}:`, e)
            // Continue with other fields even if one fails
          }
        }
      }

      // Extract text content
      if (options.extractText !== false) {
        result.text = await page.evaluate(() => {
          // Remove script and style elements
          const scripts = document.querySelectorAll('script, style, noscript')
          scripts.forEach((el) => el.remove())

          // Get main content
          const main = document.querySelector('main') || document.body
          return main.innerText || main.textContent || ''
        })
      }

      // Extract links
      if (options.extractLinks) {
        result.links = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]'))
          return links
            .map((link) => (link as HTMLAnchorElement).href)
            .filter((href) => href && !href.startsWith('javascript:'))
        })
      }

      // Extract images
      if (options.extractImages) {
        result.images = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img[src]'))
          return images.map((img) => (img as HTMLImageElement).src)
        })
      }

      // Extract specific selectors
      if (options.selectors && options.selectors.length > 0) {
        result.metadata = {}
        for (const selector of options.selectors) {
          try {
            const elements = await page.$$(selector)
            result.metadata[selector] = await Promise.all(
              elements.map((el) => el.textContent())
            )
          } catch (e) {
            result.metadata[selector] = []
          }
        }
      }

      // Run custom script
      if (options.customScript) {
        try {
          const customResult = await page.evaluate(options.customScript)
          result.metadata = {
            ...result.metadata,
            customScriptResult: customResult,
          }
        } catch (e) {
          result.metadata = {
            ...result.metadata,
            customScriptError: String(e),
          }
        }
      }

      // Take screenshot
      if (options.screenshot) {
        const screenshot = await page.screenshot({ type: 'png', fullPage: true })
        result.screenshot = screenshot.toString('base64')
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        url: options.url,
        error: error.message || String(error),
      }
    } finally {
      if (page) {
        await page.close()
      }
      if (context) {
        await context.close()
      }
    }
  }

  async scrapeMultiple(urls: string[], options?: Omit<ScrapeOptions, 'url'>): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = []
    for (const url of urls) {
      const result = await this.scrape({ ...options, url })
      results.push(result)
    }
    return results
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Singleton instance
let scraperInstance: PlaywrightScraper | null = null

export function getScraper(): PlaywrightScraper {
  if (!scraperInstance) {
    scraperInstance = new PlaywrightScraper()
  }
  return scraperInstance
}

export async function closeScraper() {
  if (scraperInstance) {
    await scraperInstance.close()
    scraperInstance = null
  }
}
