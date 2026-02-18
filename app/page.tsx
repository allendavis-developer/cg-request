"use client"

import { useState, useEffect, useRef } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ModelSelector } from "@/components/model-selector"
import { ScrapeResultDisplay } from "@/components/scrape-result"
import { RequestForm, RequestData } from "@/components/request-form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  scrapeResult?: any
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messages: Message[]
  requestData?: RequestData
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Explain quantum computing",
    lastMessage: "Quantum computing uses quantum mechanical phenomena...",
    timestamp: "2 hours ago",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Explain quantum computing in simple terms",
        timestamp: "2 hours ago",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform computations. Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or 'qubits' that can exist in multiple states simultaneously.\n\nThis allows quantum computers to process vast amounts of information in parallel, potentially solving certain problems much faster than classical computers. However, quantum computers are still in early stages and are best suited for specific types of problems like cryptography, optimization, and molecular simulation.",
        timestamp: "2 hours ago",
      },
    ],
  },
  {
    id: "2",
    title: "Python code review",
    lastMessage: "Here's an improved version of your function...",
    timestamp: "1 day ago",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can you review this Python code?",
        timestamp: "1 day ago",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "I'd be happy to review your Python code! However, I don't see any code in your message. Could you please share the code you'd like me to review?",
        timestamp: "1 day ago",
      },
    ],
  },
  {
    id: "3",
    title: "New conversation",
    lastMessage: "",
    timestamp: "Just now",
    messages: [],
  },
]

const models = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", description: "Fast and efficient (recommended)" },
]

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    mockConversations[0]?.id || null
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant")
  const [isTyping, setIsTyping] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const handleNewConversation = () => {
    setShowRequestForm(true)
    setCurrentConversationId(null)
    setSidebarOpen(false)
  }

  const handleRequestFormSubmit = async (requestData: RequestData) => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `Request: ${requestData.itemInformation.slice(0, 30)}...`,
      lastMessage: "",
      timestamp: "Just now",
      messages: [],
      requestData,
    }
    setConversations([newConv, ...conversations])
    setCurrentConversationId(newConv.id)
    setShowRequestForm(false)
    
    // Add a system message with the request data
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: `Request Information:
- Item Information: ${requestData.itemInformation}
- CR Rate: ${requestData.crRate}
- Type: ${requestData.type.toUpperCase()}
- Customer Expectation: ${requestData.customerExpectation}`,
      timestamp: "Just now",
    }
    
    // Add user message asking about item worth
    const userMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: "user",
      content: "What is this item worth?",
      timestamp: "Just now",
    }
    
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === newConv.id) {
          return {
            ...conv,
            messages: [systemMessage, userMessage],
            lastMessage: userMessage.content,
          }
        }
        return conv
      })
    )

    // Automatically call AI API to answer the question
    setIsTyping(true)
    
    try {
      const apiMessages = [
        {
          role: "assistant",
          content: systemMessage.content,
        },
        {
          role: "user",
          content: `Request Context:
- Item Information: ${requestData.itemInformation}
- CR Rate: ${requestData.crRate}
- Type: ${requestData.type.toUpperCase()}
- Customer Expectation: ${requestData.customerExpectation}

What is this item worth?`,
        },
      ]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: "llama-3.1-8b-instant",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: "assistant",
        content: data.content,
        timestamp: "Just now",
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === newConv.id) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              lastMessage: assistantMessage.content.slice(0, 50) + "...",
            }
          }
          return conv
        })
      )
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: "assistant",
        content: `Error: ${error.message || "Failed to get AI response. Make sure you've set GROQ_API_KEY in your .env file."}`,
        timestamp: "Just now",
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === newConv.id) {
            return {
              ...conv,
              messages: [...conv.messages, errorMessage],
              lastMessage: errorMessage.content.slice(0, 50) + "...",
            }
          }
          return conv
        })
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    setSidebarOpen(false)
  }

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id)
      setCurrentConversationId(remaining[0]?.id || null)
    }
  }

  // Detect if message is a scraping command
  const isScrapeCommand = (text: string): { isScrape: boolean; url?: string; options?: any } => {
    const lowerText = text.toLowerCase().trim()
    
    // Check for explicit scrape command
    if (lowerText.startsWith("scrape ") || lowerText.startsWith("/scrape ")) {
      const urlMatch = text.match(/(?:scrape|\/scrape)\s+(https?:\/\/[^\s]+)/i)
      if (urlMatch) {
        return { isScrape: true, url: urlMatch[1] }
      }
    }
    
    // Check if it's just a URL
    const urlRegex = /https?:\/\/[^\s]+/gi
    const urlMatch = text.match(urlRegex)
    if (urlMatch && text.trim().length < 200) {
      // If message is mostly just a URL, treat it as scrape command
      return { isScrape: true, url: urlMatch[0] }
    }
    
    return { isScrape: false }
  }

  // Detect if message is a request to search on uk.webuy.com
  const shouldSearchWebuy = (text: string, hasRequestContext: boolean = false): boolean => {
    const lowerText = text.toLowerCase().trim()
    
    // Don't search if it's already a scrape command or URL
    if (text.match(/https?:\/\//)) {
      return false
    }
    
    // If there's request context (from form), always search webuy
    if (hasRequestContext) {
      return true
    }
    
    // Check for explicit webuy/cex search commands
    const webuyKeywords = ['webuy', 'cex', 'search webuy', 'search cex', 'find on webuy', 'check webuy']
    const hasWebuyKeyword = webuyKeywords.some(keyword => lowerText.includes(keyword))
    
    // If it's a reasonable length request (not too short, not too long), treat as potential search
    const isReasonableRequest = lowerText.length > 3 && lowerText.length < 300
    
    // If explicitly mentions webuy/cex, or if it's a reasonable request that might be a product search
    return hasWebuyKeyword || (isReasonableRequest && !lowerText.startsWith('/'))
  }

  // Generate search term using AI tooling API
  const generateSearchTerm = async (userRequest: string, context?: string): Promise<string> => {
    try {
      const response = await fetch("/api/ai-tooling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: "generate_search_term",
          input: userRequest,
          context: context,
        }),
      })

      const result = await response.json()
      if (result.success && result.result) {
        return result.result
      }
      // Fallback to original request if AI fails
      return userRequest
    } catch (error) {
      console.error("Failed to generate search term:", error)
      // Fallback to original request
      return userRequest
    }
  }

  // Handle webuy.com search with form filling
  const handleWebuySearch = async (userRequest: string, convId: string) => {
    setIsScraping(true)
    
    try {
      // Get context from conversation if available
      const currentConv = conversations.find((c) => c.id === convId)
      const context = currentConv?.requestData
        ? `Item Information: ${currentConv.requestData.itemInformation}, CR Rate: ${currentConv.requestData.crRate}, Type: ${currentConv.requestData.type}, Customer Expectation: ${currentConv.requestData.customerExpectation}`
        : undefined

      // Generate search term using AI tooling
      const searchTerm = await generateSearchTerm(userRequest, context)

      // Add a message showing we're searching
      const searchingMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Searching uk.webuy.com for "${searchTerm}"...`,
        timestamp: "Just now",
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, searchingMessage],
            }
          }
          return conv
        })
      )

      // Scrape uk.webuy.com with form filling
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://uk.webuy.com",
          waitForSelector: "#predictiveSearchText",
          waitForTimeout: 15000,
          extractText: true,
          extractLinks: true,
          fillForm: [
            {
              selector: "#predictiveSearchText",
              value: searchTerm,
              triggerChange: true,
            },
          ],
        }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: result.success
          ? `I've searched uk.webuy.com for "${searchTerm}" and filled in the search field. Here's what I found:`
          : `I encountered an error while searching: ${result.error}`,
        timestamp: "Just now",
        scrapeResult: result,
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              lastMessage: result.success
                ? `Searched: ${searchTerm}`
                : `Search failed: ${searchTerm}`,
            }
          }
          return conv
        })
      )
    } catch (error: any) {
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Error: ${error.message || "Failed to search uk.webuy.com"}`,
        timestamp: "Just now",
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
            }
          }
          return conv
        })
      )
    } finally {
      setIsScraping(false)
    }
  }

  const handleScrape = async (url: string, convId: string) => {
    setIsScraping(true)
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          extractText: true,
          extractLinks: true,
          extractImages: true,
          screenshot: false, // Set to true if you want screenshots
        }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: result.success
          ? `I've successfully scraped the website. Here's what I found:`
          : `I encountered an error while scraping: ${result.error}`,
        timestamp: "Just now",
        scrapeResult: result,
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              lastMessage: result.success
                ? `Scraped: ${result.title || url}`
                : `Scrape failed: ${url}`,
            }
          }
          return conv
        })
      )
    } catch (error: any) {
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Error: ${error.message || "Failed to scrape the website"}`,
        timestamp: "Just now",
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
            }
          }
          return conv
        })
      )
    } finally {
      setIsScraping(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    // If no conversation and form not shown, show form first
    if (!currentConversationId && !showRequestForm) {
      setShowRequestForm(true)
      return
    }

    const scrapeCheck = isScrapeCommand(content)
    let targetConvId = currentConversationId
    
    // Create new conversation if needed (shouldn't happen if form is working)
    if (!targetConvId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: scrapeCheck.isScrape && scrapeCheck.url
          ? `Scrape: ${scrapeCheck.url.slice(0, 40)}...`
          : content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        lastMessage: content,
        timestamp: "Just now",
        messages: [],
      }
      setConversations((prev) => [newConv, ...prev])
      setCurrentConversationId(newConv.id)
      targetConvId = newConv.id
    }

    // Get conversation before updating (for API context)
    const currentConv = conversations.find((c) => c.id === targetConvId)
    const previousMessages = currentConv?.messages || []

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content,
      timestamp: "Just now",
    }

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === targetConvId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage],
            title:
              conv.messages.length === 0
                ? scrapeCheck.isScrape && scrapeCheck.url
                  ? `Scrape: ${scrapeCheck.url.slice(0, 40)}...`
                  : content.slice(0, 50) + (content.length > 50 ? "..." : "")
                : conv.title,
            lastMessage: content,
            timestamp: "Just now",
          }
        }
        return conv
      })
    )

    // Handle scraping, webuy search, or regular message
    const hasRequestContext = !!currentConv?.requestData
    
    if (scrapeCheck.isScrape && scrapeCheck.url) {
      await handleScrape(scrapeCheck.url, targetConvId!)
    } else if (shouldSearchWebuy(content, hasRequestContext)) {
      await handleWebuySearch(content, targetConvId!)
    } else {
      // Call AI API
      setIsTyping(true)

      try {
        // Include request data in context if available
        const requestContext = currentConv?.requestData
          ? `Request Context:
- Item Information: ${currentConv.requestData.itemInformation}
- CR Rate: ${currentConv.requestData.crRate}
- Type: ${currentConv.requestData.type.toUpperCase()}
- Customer Expectation: ${currentConv.requestData.customerExpectation}

`
          : ""

        // Format messages for API (include all previous messages + new user message)
        const apiMessages = [
          ...previousMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: requestContext + content,
          },
        ]

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            model: "llama-3.1-8b-instant",
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to get AI response")
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.content,
          timestamp: "Just now",
        }

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                lastMessage: assistantMessage.content.slice(0, 50) + "...",
              }
            }
            return conv
          })
        )
      } catch (error: any) {
        const errorMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `Error: ${error.message || "Failed to get AI response. Make sure you've set GROQ_API_KEY in your .env file."}`,
          timestamp: "Just now",
        }

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: errorMessage.content.slice(0, 50) + "...",
              }
            }
            return conv
          })
        )
      } finally {
        setIsTyping(false)
      }
    }
  }



  return (
    <div className="flex h-screen bg-[#171717] text-white overflow-hidden">
      <Sidebar
        conversations={conversations.map(({ id, title, lastMessage, timestamp }) => ({
          id,
          title,
          lastMessage,
          timestamp,
        }))}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-gray-800/50 flex items-center justify-between px-4 bg-[#171717]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-medium text-gray-300">
              {currentConversation?.title || "New conversation"}
            </h1>
          </div>
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </header>

        {/* Messages area */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {showRequestForm ? (
              <RequestForm onSubmit={handleRequestFormSubmit} />
            ) : currentConversation?.messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <h2 className="text-3xl font-semibold mb-4">How can I help you today?</h2>
                </div>
              </div>
            ) : (
              <>
                {currentConversation?.messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                    {message.scrapeResult && (
                      <div className="w-full border-b border-gray-800/50 bg-[#212121]">
                        <div className="mx-auto max-w-3xl px-4 py-4">
                          <ScrapeResultDisplay result={message.scrapeResult} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(isTyping || isScraping) && (
                  <div className="w-full border-b border-gray-800/50 bg-[#212121]">
                    <div className="mx-auto max-w-3xl px-4 py-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-[#10A37F]">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-400 text-sm">
                            {isScraping ? "Scraping website..." : "Thinking..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input area - hide when showing request form */}
        {!showRequestForm && (
          <ChatInput onSend={handleSendMessage} disabled={isTyping || isScraping} />
        )}
      </div>
    </div>
  )
}
