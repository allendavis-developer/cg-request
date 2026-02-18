"use client"

import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ScrapeResultDisplay } from "@/components/scrape-result"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isThinking?: boolean
  thinkingSteps?: string[]
  scrapeResult?: any
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [thinkingExpanded, setThinkingExpanded] = useState(true)

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
                  <div className="px-3 pb-3 space-y-1.5">
                    {message.thinkingSteps!.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regular Content */}
            {message.content && (
              <div className="prose prose-invert max-w-none mb-3">
                <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              </div>
            )}

            {/* Scraping Results */}
            {message.scrapeResult && (
              <div className="mt-3">
                <ScrapeResultDisplay result={message.scrapeResult} />
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
