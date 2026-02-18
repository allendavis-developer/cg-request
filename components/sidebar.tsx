"use client"

import { useState } from "react"
import { Plus, MessageSquare, Trash2, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#171717] border-r border-gray-800/50 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewConversation}
              className="flex-1 justify-start text-white hover:bg-gray-800 h-9 px-3 rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              New request
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-white hover:bg-gray-800 h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative"
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3",
                    currentConversationId === conv.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800/50"
                  )}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{conv.title}</span>
                </button>
                {hoveredId === conv.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conv.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white h-9 px-3 rounded-md"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </>
  )
}
