import { WebsiteConfig } from './playwright-scraper'

/**
 * Website configurations for product card extraction
 * Add new websites here by creating a new config object
 */
export const websiteConfigs: WebsiteConfig[] = [
  {
    domain: ['webuy.com', 'cex.io'],
    baseUrl: 'https://uk.webuy.com',
    selectors: {
      // Card container selectors (tried in order)
      cardContainer: [
        '.search-product-card',
        '.cx-card-product',
        '[class*="product-card"]',
      ],
      // Title selectors
      title: [
        '.card-title a',
        '.card-title',
        'h3',
        '[class*="title"]',
      ],
      // Title link (if title is inside a link)
      titleLink: [
        '.card-title a',
      ],
      // Product URL selectors
      productUrl: [
        '.card-title a',
        'a[href*="product-detail"]',
        'a[href*="product"]',
      ],
      // Image selectors - IMPORTANT: Use the exact selector from the DOM
      // The image is inside .card-img > a > img (not just .card-img img)
      image: [
        '.card-img > a > img', // Primary selector - exact match
        '.card-img a img',
        '.card-img img',
        '.thumbnail a img',
        '.thumbnail img',
        'img[src*="product_images"]',
        'img[src*="product"]',
      ],
      // Category/subtitle selectors
      category: [
        '.card-subtitle',
        '[class*="subtitle"]',
        '[class*="category"]',
      ],
      // Grade selectors
      grade: [
        '.grade-letter',
        '[class*="grade-letter"]',
      ],
      gradeTitle: [
        '.grade-title',
        '[class*="grade-title"]',
      ],
      // Rating selectors
      rating: [
        '.card-rating span',
        '[class*="rating"] span',
      ],
      // Price selectors
      price: [
        '.price-wrapper .product-main-price',
        '.product-main-price',
        '[class*="price"]',
      ],
      priceReduction: [
        '.price-wrapper .price-reduction',
        '.price-reduction',
      ],
      // Trade-in price selectors
      tradeInVoucher: [
        '.tradeInPrices .product-main-price', // First one with "Voucher" text
      ],
      tradeInCash: [
        '.tradeInPrices .product-main-price', // Second one with "Cash" text
      ],
      // Warranty badge selector
      warrantyBadge: [
        '.cx-warranty-badge',
        '[class*="warranty"]',
        'img[alt*="Warranty"]',
      ],
    },
  },
  // Add more website configurations here:
  // {
  //   domain: 'example.com',
  //   baseUrl: 'https://example.com',
  //   selectors: {
  //     cardContainer: ['.product-card'],
  //     title: ['.product-title'],
  //     image: ['.product-image img'],
  //     price: ['.product-price'],
  //     // ... etc
  //   },
  // },
]

/**
 * Get website configuration for a given URL
 */
export function getWebsiteConfig(url: string): WebsiteConfig | null {
  for (const config of websiteConfigs) {
    const domains = Array.isArray(config.domain) ? config.domain : [config.domain]
    if (domains.some(domain => url.includes(domain))) {
      return config
    }
  }
  return null
}
