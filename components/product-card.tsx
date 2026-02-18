"use client"

import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface ProductCardData {
  // Core product info
  title: string
  imageUrl?: string
  productUrl?: string
  category?: string
  
  // Grade and condition
  grade?: string
  gradeTitle?: string // e.g., "Working", "A", "B", "C"
  
  // Rating
  rating?: number
  
  // Pricing
  price?: string // Main buy price
  priceReduction?: string // Any discount/reduction text
  tradeInVoucher?: string // Trade-in price for voucher
  tradeInCash?: string // Trade-in price for cash
  
  // Additional features
  warrantyBadge?: boolean // 5 Year Warranty badge
  source?: string // e.g., "webuy.com", "cex", etc.
  
  // Optional metadata for extensibility
  metadata?: Record<string, any>
}

interface ProductCardProps {
  product: ProductCardData
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const {
    title,
    imageUrl,
    productUrl,
    category,
    grade,
    gradeTitle,
    rating,
    price,
    priceReduction,
    tradeInVoucher,
    tradeInCash,
    warrantyBadge,
    source,
  } = product

  // Grade color mapping (matching CEX style)
  const getGradeColor = (grade?: string) => {
    if (!grade) return "bg-gray-600"
    const gradeUpper = grade.toUpperCase()
    if (gradeUpper === "A") return "bg-green-600"
    if (gradeUpper === "B") return "bg-blue-600"
    if (gradeUpper === "C") return "bg-gray-600"
    if (gradeUpper === "D") return "bg-yellow-600"
    return "bg-gray-600"
  }

  const CardContent = (
    <div className={cn(
      "search-product-card",
      "group relative",
      className
    )}>
      <div className="cx-card cx-card-product vertical cx-card-animate bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden">
        {/* Thumbnail Section */}
        <div className="relative">
          <div className="wrapper-box trade-inprice-open relative">
            {/* Warranty Badge */}
            {warrantyBadge && (
              <div className="absolute top-2 left-2 z-10">
                <div className="cx-warranty-badge">
                  <img
                    alt="5 Year Warranty"
                    loading="lazy"
                    src="https://uk.static.webuy.com/images/category/uk_badge.png"
                    srcSet="https://uk.static.webuy.com/images/category/uk_badge.png 1x, https://uk.static.webuy.com/images/category/uk_badge.png 2x"
                    className="h-8 w-auto"
                  />
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="thumbnail">
              <div className="card-img relative aspect-square bg-gray-900 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      const target = e.target as HTMLImageElement
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <div className="text-xs">No Image</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content p-4 space-y-2">
          {/* Metadata Row: Grade and Rating */}
          <div className="card-metadata flex items-center justify-between">
            {/* Grade */}
            {grade && (
              <div className="card-grade">
                <div className="grade flex items-center gap-2">
                  <span className={cn(
                    "grade-letter px-2 py-1 rounded text-white text-xs font-bold",
                    getGradeColor(grade)
                  )}>
                    {grade}
                  </span>
                  {gradeTitle && (
                    <span className="grade-title text-xs text-gray-400">
                      {gradeTitle}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Rating */}
            {rating !== undefined && (
              <div className="card-rating flex items-center gap-1 text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs text-gray-400">{rating}</span>
              </div>
            )}
          </div>

          {/* Category/Subtitle */}
          {category && (
            <div className="card-subtitle text-xs text-gray-500 uppercase tracking-wide">
              {category}
            </div>
          )}

          {/* Product Title */}
          <div className="card-title">
            <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
              {title}
            </h3>
          </div>

          {/* Pricing Section */}
          <div className="product-prices space-y-2">
            {/* Main Price */}
            {price && (
              <div className="price-wrapper flex items-center justify-between">
                {priceReduction && (
                  <p className="price-reduction text-xs text-red-400 line-through">
                    {priceReduction}
                  </p>
                )}
                <p className="product-main-price text-lg font-semibold text-white">
                  {price}
                </p>
                <Button
                  size="sm"
                  className="cx-btn cx-btn-md cx-btn-primary btn-rounded add-cart-button h-8 w-8 p-0 bg-[#10A37F] hover:bg-[#0d8a6d] text-white rounded-full"
                  aria-label="add cart button"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Trade-in Prices */}
            {(tradeInVoucher || tradeInCash) && (
              <div className="tradeInPrices cursor-pointer space-y-1 pt-2 border-t border-gray-800">
                {tradeInVoucher && (
                  <p className="product-main-price flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{tradeInVoucher}</span>
                    <span className="text-xs text-gray-400 hover:underline">
                      Trade in for Voucher
                    </span>
                  </p>
                )}
                {tradeInCash && (
                  <p className="product-main-price flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{tradeInCash}</span>
                    <span className="text-xs text-gray-400 hover:underline">
                      Trade in for Cash
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Wrap in link if productUrl is provided
  if (productUrl) {
    return (
      <Link
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {CardContent}
      </Link>
    )
  }

  return CardContent
}

// Grid container for multiple product cards
interface ProductCardGridProps {
  products: ProductCardData[]
  className?: string
}

export function ProductCardGrid({ products, className }: ProductCardGridProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
      className
    )}>
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  )
}
