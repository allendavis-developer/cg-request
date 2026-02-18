"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="sticky bottom-0 w-full border-t border-gray-800/50 bg-[#171717]">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatGPT... (or paste a URL to scrape)"
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-2xl border border-gray-600/50 bg-[#40414f] px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 disabled:opacity-50",
                  "max-h-[200px] overflow-y-auto"
                )}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#6b7280 transparent",
                }}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-600"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || disabled}
              className="h-9 w-9 rounded-lg bg-[#10A37F] hover:bg-[#0d8f6e] text-white disabled:opacity-50 disabled:cursor-not-allowed p-0 flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            ChatGPT can make mistakes. Check important info.
          </div>
        </form>
      </div>
    </div>
  )
}
