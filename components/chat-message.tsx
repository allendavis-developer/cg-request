"use client"

import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ScrapeResultDisplay } from "@/components/scrape-result"
import { CompactProductCardList } from "@/components/product-card-compact"
import { RefinementQuestions } from "@/components/refinement-questions"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isThinking?: boolean
  thinkingSteps?: string[]
  scrapeResult?: any
  refinementQuestions?: any[]
  refinementAnswers?: Record<string, string>
}

interface ChatMessageProps {
  message: Message
  onRefinementAnswer?: (messageId: string, questionId: string, answer: string) => void
}

export function ChatMessage({ message, onRefinementAnswer }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [thinkingExpanded, setThinkingExpanded] = useState(true)
  const [stepsExpanded, setStepsExpanded] = useState(true)
  const [scrapingExpanded, setScrapingExpanded] = useState(true)
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [contentExpanded, setContentExpanded] = useState(true)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"
  // Show thinking panel if currently thinking OR if there are completed thinking steps
  const hasThinkingSteps = !isUser && message.thinkingSteps && message.thinkingSteps.length > 0
  const isCurrentlyThinking = message.isThinking === true

  return (
    <div
      className={cn(
        "group relative w-full border-b border-gray-800/50",
        isUser ? "bg-[#171717]" : "bg-[#212121]"
      )}
    >
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center mt-1",
              isUser ? "bg-[#5436DA]" : "bg-[#10A37F]"
            )}
          >
            {isUser ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Thinking Progress Panel - Show if there are thinking steps (active or completed) */}
            {hasThinkingSteps && (
              <div className="mb-3 rounded-lg border border-gray-700/50 bg-gray-800/30 overflow-hidden">
                <button
                  onClick={() => setThinkingExpanded(!thinkingExpanded)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-300">
                    {isCurrentlyThinking ? "Processing..." : "Processed"}
                  </span>
                  {thinkingExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {thinkingExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {/* Thinking Steps Sub-section */}
                    {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                      <div className="border border-gray-700/30 rounded overflow-hidden">
                        <button
                          onClick={() => setStepsExpanded(!stepsExpanded)}
                          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/20 transition-colors text-xs"
                        >
                          <span className="text-gray-400 font-medium">Steps</span>
                          {stepsExpanded ? (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                        {stepsExpanded && (
                          <div className="px-2 pb-2 space-y-1">
                            {message.thinkingSteps.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-400"
                              >
                                <div className="mt-1 h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scraping Status Sub-section */}
                    {message.scrapeResult && (
                      <div className="border border-gray-700/30 rounded overflow-hidden">
                        <button
                          onClick={() => setScrapingExpanded(!scrapingExpanded)}
                          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/20 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {message.scrapeResult.success ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-400" />
                                <span className="text-gray-400 font-medium">Scraping Successful</span>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-400 font-medium">Scraping Failed</span>
                              </>
                            )}
                          </div>
                          {scrapingExpanded ? (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                        {scrapingExpanded && (
                          <div className="px-2 pb-2 space-y-2">
                            {message.scrapeResult.success ? (
                              <>
                                <div className="p-2 rounded border border-gray-700/50 bg-gray-800/50">
                                  <div className="text-xs text-gray-400 mb-1">Scraped Page URL:</div>
                                  <a
                                    href={message.scrapeResult.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1 break-all"
                                  >
                                    {message.scrapeResult.url}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  </a>
                                </div>
                                {message.scrapeResult.title && (
                                  <div className="text-xs text-gray-300">
                                    <span className="text-gray-400">Title: </span>
                                    {message.scrapeResult.title}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-red-400">
                                {message.scrapeResult.error || "Unknown error"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Products Sub-section */}
                    {message.scrapeResult?.products && message.scrapeResult.products.length > 0 && (
                      <div className="border border-gray-700/30 rounded overflow-hidden">
                        <button
                          onClick={() => setProductsExpanded(!productsExpanded)}
                          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/20 transition-colors text-xs"
                        >
                          <span className="text-gray-400 font-medium">
                            Products Found ({message.scrapeResult.products.length})
                          </span>
                          {productsExpanded ? (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                        {productsExpanded && (
                          <div className="px-2 pb-2 max-h-96 overflow-y-auto">
                            <CompactProductCardList 
                              products={message.scrapeResult.products} 
                              maxItems={10}
                            />
                            {message.scrapeResult.products.length > 10 && (
                              <div className="text-xs text-gray-400 text-center py-2 mt-2 border-t border-gray-700/30">
                                Showing first 10 of {message.scrapeResult.products.length} products
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Message Sub-section */}
                    {message.content && (
                      <div className="border border-gray-700/30 rounded overflow-hidden">
                        <button
                          onClick={() => setContentExpanded(!contentExpanded)}
                          className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/20 transition-colors text-xs"
                        >
                          <span className="text-gray-400 font-medium">Message</span>
                          {contentExpanded ? (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                        {contentExpanded && (
                          <div className="px-2 pb-2">
                            <div className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Show full scrape results outside thinking panel if no thinking steps */}
            {!hasThinkingSteps && message.scrapeResult && (
              <div className="mt-3">
                <ScrapeResultDisplay result={message.scrapeResult} />
              </div>
            )}

            {/* Show content outside thinking panel if no thinking steps */}
            {!hasThinkingSteps && message.content && (
              <div className="prose prose-invert max-w-none mb-3">
                <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              </div>
            )}

            {/* Refinement Questions - Show after thinking is complete */}
            {message.refinementQuestions && message.refinementQuestions.length > 0 && !isCurrentlyThinking && (
              <div className="mt-4">
                <RefinementQuestions
                  questions={message.refinementQuestions}
                  answers={message.refinementAnswers || {}}
                  onAnswer={(questionId, answer) => {
                    if (onRefinementAnswer) {
                      onRefinementAnswer(message.id, questionId, answer)
                    }
                  }}
                />
              </div>
            )}

            {/* Action buttons (only for assistant messages) */}
            {!isUser && (
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={cn(
                    "h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md",
                    liked === true && "text-green-500"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={cn(
                    "h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md",
                    liked === false && "text-red-500"
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
