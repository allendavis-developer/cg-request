"use client"

import { ShoppingCart, Star, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ProductCardData } from "@/components/product-card"

interface CompactProductCardProps {
  product: ProductCardData
  className?: string
}

export function CompactProductCard({ product, className }: CompactProductCardProps) {
  const {
    title,
    imageUrl,
    productUrl,
    category,
    grade,
    gradeTitle,
    rating,
    price,
    tradeInVoucher,
    tradeInCash,
    warrantyBadge,
  } = product

  // Grade color mapping
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
      "flex items-center gap-3 p-2 rounded border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors",
      className
    )}>
      {/* Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded bg-gray-900 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23333' width='64' height='64'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='10' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            📦
          </div>
        )}
        {warrantyBadge && (
          <div className="absolute top-0.5 left-0.5">
            <img
              alt="5 Year Warranty"
              src="https://uk.static.webuy.com/images/category/uk_badge.png"
              className="h-4 w-auto"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title and Category */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-white truncate line-clamp-1">
              {title}
            </h4>
            {category && (
              <p className="text-xs text-gray-500 mt-0.5">{category}</p>
            )}
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Grade */}
          {grade && (
            <div className="flex items-center gap-1">
              <span className={cn(
                "grade-letter px-1.5 py-0.5 rounded text-white text-xs font-bold",
                getGradeColor(grade)
              )}>
                {grade}
              </span>
              {gradeTitle && (
                <span className="text-xs text-gray-400">{gradeTitle}</span>
              )}
            </div>
          )}

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs text-gray-400">{rating}</span>
            </div>
          )}

          {/* Price */}
          {price && (
            <span className="text-xs font-semibold text-white">{price}</span>
          )}

          {/* Trade-in prices */}
          {tradeInVoucher && (
            <span className="text-xs text-gray-400">V: {tradeInVoucher}</span>
          )}
          {tradeInCash && (
            <span className="text-xs text-gray-400">C: {tradeInCash}</span>
          )}
        </div>
      </div>

      {/* Link Icon */}
      {productUrl && (
        <div className="flex-shrink-0">
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </div>
      )}
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

// Horizontal list for compact cards
interface CompactProductCardListProps {
  products: ProductCardData[]
  className?: string
  maxItems?: number
}

export function CompactProductCardList({ products, className, maxItems }: CompactProductCardListProps) {
  if (!products || products.length === 0) {
    return null
  }

  const displayProducts = maxItems ? products.slice(0, maxItems) : products
  const remainingCount = maxItems && products.length > maxItems ? products.length - maxItems : 0

  return (
    <div className={cn("space-y-1.5", className)}>
      {displayProducts.map((product, index) => (
        <CompactProductCard key={index} product={product} />
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-700/30 pt-2">
          ... and {remainingCount} more products
        </div>
      )}
    </div>
  )
}
