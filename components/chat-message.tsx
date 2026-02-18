"use client"

import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"

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
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </div>
            </div>

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
