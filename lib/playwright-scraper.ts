import { chromium, Browser, Page, BrowserContext } from 'playwright'
import { getWebsiteConfig } from './website-configs'

export interface FormFillAction {
  selector: string
  value: string
  triggerChange?: boolean // Whether to trigger input/change events
}

export interface ProductCardSelectors {
  // Card container selectors (try in order)
  cardContainer: string[]
  // Selectors for extracting product data
  title: string[]
  titleLink?: string[] // If title is inside a link
  productUrl: string[]
  image: string[] // Image selector (should exclude badges/icons)
  category: string[]
  grade?: string[]
  gradeTitle?: string[]
  rating?: string[]
  price: string[]
  priceReduction?: string[]
  tradeInVoucher?: string[]
  tradeInCash?: string[]
  warrantyBadge?: string[]
}

export interface WebsiteConfig {
  domain: string | string[] // Domain(s) to match
  selectors: ProductCardSelectors
  baseUrl?: string // Base URL for relative links
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
  websiteConfig?: WebsiteConfig // Custom website configuration
}

export interface ProductCardData {
  title: string
  imageUrl?: string
  productUrl?: string
  category?: string
  grade?: string
  gradeTitle?: string
  rating?: number
  price?: string
  priceReduction?: string
  tradeInVoucher?: string
  tradeInCash?: string
  warrantyBadge?: boolean
  source?: string
  metadata?: Record<string, any>
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
  products?: ProductCardData[] // Extracted product cards
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

            // If this is a webuy.com search, submit the search
            if (options.url.includes('webuy.com') && fillAction.selector === '#predictiveSearchText') {
              // Wait a bit for autocomplete to appear
              await page.waitForTimeout(1500)
              
              try {
                // First, try to find and click the first autocomplete result
                const autocompleteSelectors = [
                  '.predictive-search-results a',
                  '.search-suggestions a',
                  '[class*="autocomplete"] a',
                  '[class*="suggestion"] a',
                  '[class*="search-result"] a',
                  'ul[class*="search"] li a',
                  'div[class*="dropdown"] a'
                ]
                
                let clicked = false
                for (const selector of autocompleteSelectors) {
                  try {
                    const autocompleteItem = await page.waitForSelector(selector, { timeout: 1000 })
                    if (autocompleteItem) {
                      // Click the first suggestion to navigate to search results
                      await Promise.all([
                        page.waitForNavigation({ timeout: 10000, waitUntil: 'networkidle' }).catch(() => {}),
                        autocompleteItem.click()
                      ])
                      clicked = true
                      break
                    }
                  } catch (e) {
                    // Try next selector
                    continue
                  }
                }
                
                if (!clicked) {
                  // No autocomplete found, try pressing Enter to submit the form
                  await Promise.all([
                    page.waitForNavigation({ timeout: 10000, waitUntil: 'networkidle' }).catch(() => {}),
                    page.press(fillAction.selector, 'Enter')
                  ])
                  await page.waitForTimeout(2000) // Additional wait for results
                }
                
                // Update result URL to the actual page we're on
                result.url = page.url()
                result.title = await page.title()
              } catch (e) {
                console.warn('Failed to submit search, continuing anyway:', e)
                // Update URL even if navigation didn't happen (might still be on homepage)
                result.url = page.url()
              }
            }
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

      // Extract product cards using website configuration
      const websiteConfig = options.websiteConfig || getWebsiteConfig(options.url)
      
      if (websiteConfig) {
        try {
          // Wait for search results to load after form fill
          if (options.fillForm && options.fillForm.length > 0) {
            // Wait for product cards to appear on the search results page
            const cardSelectors = websiteConfig.selectors.cardContainer.join(', ')
            try {
              await page.waitForSelector(cardSelectors, {
                timeout: 10000,
              })
              // Additional wait for all cards to load
              await page.waitForTimeout(1000)
            } catch (e) {
              // If cards don't appear, wait a bit more
              await page.waitForTimeout(3000)
            }
          }

          const products = await page.evaluate((config) => {
            const productCards: any[] = []
            const selectors = config.selectors
            const baseUrl = config.baseUrl || ''
            const domains = Array.isArray(config.domain) ? config.domain : [config.domain]
            const source = domains[0] || 'unknown'
            
            // Find all product cards - try selectors in order
            let cards: Element[] = []
            for (const selector of selectors.cardContainer) {
              const found = Array.from(document.querySelectorAll(selector))
              if (found.length > 0) {
                cards = found
                break
              }
            }

            // Helper function to try multiple selectors
            const trySelectors = (selectors: string[], context: Element = document.body): Element | null => {
              for (const selector of selectors) {
                try {
                  const el = context.querySelector(selector)
                  if (el) return el
                } catch (e) {
                  // Invalid selector, try next
                  continue
                }
              }
              return null
            }

            // Helper function to try multiple selectors and get text
            const trySelectorsText = (selectors: string[], context: Element = document.body): string => {
              const el = trySelectors(selectors, context)
              return el?.textContent?.trim() || ''
            }

            // Helper function to get href from selectors
            const trySelectorsHref = (selectors: string[], context: Element = document.body): string => {
              const el = trySelectors(selectors, context) as HTMLAnchorElement
              if (el && el.href) {
                return el.href.startsWith('http') ? el.href : `${baseUrl}${el.href}`
              }
              return ''
            }

            cards.forEach((card) => {
              try {
                const product: any = {
                  title: '',
                  source: source,
                }

                // Extract title
                if (selectors.titleLink && selectors.titleLink.length > 0) {
                  // Try title link first (title is inside link)
                  const titleLinkEl = trySelectors(selectors.titleLink, card) as HTMLAnchorElement
                  if (titleLinkEl) {
                    product.title = titleLinkEl.textContent?.trim() || ''
                    if (titleLinkEl.href) {
                      product.productUrl = titleLinkEl.href.startsWith('http') 
                        ? titleLinkEl.href 
                        : `${baseUrl}${titleLinkEl.href}`
                    }
                  } else {
                    // Fallback to regular title selectors
                    product.title = trySelectorsText(selectors.title, card)
                  }
                } else {
                  product.title = trySelectorsText(selectors.title, card)
                }

                // Extract product URL if not already set
                if (!product.productUrl && selectors.productUrl) {
                  product.productUrl = trySelectorsHref(selectors.productUrl, card)
                }

                // Extract image - use the configured selectors
                if (selectors.image) {
                  const imgEl = trySelectors(selectors.image, card) as HTMLImageElement
                  if (imgEl) {
                    const imgSrc = imgEl.src
                    // Skip warranty badge images and icons
                    if (imgSrc && !imgSrc.includes('badge') && !imgSrc.includes('icon') && !imgSrc.includes('warranty')) {
                      product.imageUrl = imgSrc
                    }
                  }
                }

                // Extract category
                if (selectors.category) {
                  product.category = trySelectorsText(selectors.category, card)
                }

                // Extract grade
                if (selectors.grade) {
                  product.grade = trySelectorsText(selectors.grade, card)
                }

                // Extract grade title
                if (selectors.gradeTitle) {
                  product.gradeTitle = trySelectorsText(selectors.gradeTitle, card)
                }

                // Extract rating
                if (selectors.rating) {
                  const ratingEl = trySelectors(selectors.rating, card)
                  if (ratingEl) {
                    const ratingText = ratingEl.textContent?.trim() || ''
                    const ratingMatch = ratingText.match(/[\d.]+/)
                    if (ratingMatch) {
                      product.rating = parseFloat(ratingMatch[0])
                    }
                  }
                }

                // Extract main price
                if (selectors.price) {
                  const priceText = trySelectorsText(selectors.price, card)
                  const priceMatch = priceText.match(/£[\d,]+\.?\d*/)
                  if (priceMatch) {
                    product.price = priceMatch[0]
                  }
                }

                // Extract price reduction
                if (selectors.priceReduction) {
                  const reductionText = trySelectorsText(selectors.priceReduction, card)
                  const reductionMatch = reductionText.match(/£[\d,]+\.?\d*/)
                  if (reductionMatch) {
                    product.priceReduction = reductionMatch[0]
                  }
                }

                // Extract trade-in prices
                if (selectors.tradeInVoucher || selectors.tradeInCash) {
                  // For webuy.com, both use same selector, differentiate by text
                  const tradeInSection = card.querySelector('.tradeInPrices')
                  if (tradeInSection) {
                    const tradeInPrices = tradeInSection.querySelectorAll('.product-main-price')
                    tradeInPrices.forEach((priceEl) => {
                      const priceText = priceEl.textContent || ''
                      const priceMatch = priceText.match(/£[\d,]+\.?\d*/)
                      if (priceMatch) {
                        const parentText = priceEl.parentElement?.textContent || ''
                        if (parentText.includes('Voucher')) {
                          product.tradeInVoucher = priceMatch[0]
                        } else if (parentText.includes('Cash')) {
                          product.tradeInCash = priceMatch[0]
                        }
                      }
                    })
                  }
                }

                // Check for warranty badge
                if (selectors.warrantyBadge) {
                  product.warrantyBadge = !!trySelectors(selectors.warrantyBadge, card)
                }

                // Only add if we have at least a title
                if (product.title) {
                  productCards.push(product)
                }
              } catch (e) {
                console.warn('Error extracting product card:', e)
              }
            })

            return productCards
          }, websiteConfig)

          if (products && products.length > 0) {
            result.products = products
          }
        } catch (e) {
          console.warn('Error extracting products:', e)
          // Don't fail the whole scrape if product extraction fails
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
