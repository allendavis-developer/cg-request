"use client"

import { ExternalLink, CheckCircle, XCircle, Image as ImageIcon, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProductCardGrid, ProductCardData } from "@/components/product-card"

interface ScrapeResult {
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

interface ScrapeResultProps {
  result: ScrapeResult
}

export function ScrapeResultDisplay({ result }: ScrapeResultProps) {
  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <XCircle className="h-5 w-5" />
          <span className="font-semibold">Scraping Failed</span>
        </div>
        <p className="text-red-300 text-sm">{result.error || "Unknown error"}</p>
        <p className="text-gray-400 text-xs mt-2">URL: {result.url}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Scraping Successful</span>
          </div>
          <div className="mb-3 p-3 rounded-lg border border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 mb-1">Scraped Page URL:</div>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 break-all"
            >
              {result.url}
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>
          {result.title && (
            <h3 className="text-lg font-semibold text-white mt-2">{result.title}</h3>
          )}
        </div>
      </div>

      {/* Product Cards - Show cards if available, otherwise show other content */}
      {result.products && result.products.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <span className="text-sm font-semibold">Products Found ({result.products.length}):</span>
          </div>
          <ProductCardGrid products={result.products} />
        </div>
      ) : (
        <>
          {/* Text Content */}
      {result.text && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Content:</h4>
          <div className="text-gray-200 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {result.text.slice(0, 5000)}
            {result.text.length > 5000 && (
              <span className="text-gray-400">... (truncated, {result.text.length} characters total)</span>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {result.links && result.links.length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <LinkIcon className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Links ({result.links.length}):</h4>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.links.slice(0, 20).map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 text-xs truncate"
              >
                {link}
              </a>
            ))}
            {result.links.length > 20 && (
              <p className="text-gray-400 text-xs">... and {result.links.length - 20} more</p>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {result.images && result.images.length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <ImageIcon className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Images ({result.images.length}):</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {result.images.slice(0, 16).map((img, idx) => (
              <a
                key={idx}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-700 hover:border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </a>
            ))}
          </div>
          {result.images.length > 16 && (
            <p className="text-gray-400 text-xs mt-2">... and {result.images.length - 16} more</p>
          )}
        </div>
      )}

      {/* Screenshot */}
      {result.screenshot && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Screenshot:</h4>
          <img
            src={`data:image/png;base64,${result.screenshot}`}
            alt="Page screenshot"
            className="w-full rounded border border-gray-700"
          />
        </div>
      )}

      {/* Metadata */}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Extracted Data:</h4>
          <div className="space-y-2">
            {Object.entries(result.metadata).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-400 mb-1">{key}:</p>
                <pre className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
