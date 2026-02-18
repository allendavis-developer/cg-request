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
  isThinking?: boolean
  thinkingSteps?: string[]
  refinementQuestions?: any[] // Questions to refine product selection
  refinementAnswers?: Record<string, string> // User's answers to questions
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
    
    // Add user message with request information
    const userMessageContent = `Request Information:
- Item Information: ${requestData.itemInformation}
- CR Rate: ${requestData.crRate}
- Type: ${requestData.type.toUpperCase()}
- Customer Expectation: ${requestData.customerExpectation}

User Request: What is this item worth?`
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      timestamp: "Just now",
    }
    
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === newConv.id) {
          return {
            ...conv,
            messages: [userMessage],
            lastMessage: "What is this item worth?",
          }
        }
        return conv
      })
    )

    // Automatically trigger webuy search instead of AI chat
    await handleWebuySearch(requestData.itemInformation, newConv.id, requestData)
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

  // Helper function to create or update thinking message
  const updateThinkingMessage = (convId: string, steps: string[], isComplete: boolean = false) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === convId) {
          // Find existing thinking message or create new one
          const existingThinkingIndex = conv.messages.findIndex(
            (msg) => msg.isThinking === true
          )
          
          const thinkingMessage: Message = {
            id: existingThinkingIndex >= 0 
              ? conv.messages[existingThinkingIndex].id 
              : `msg-thinking-${Date.now()}`,
            role: "assistant",
            content: isComplete ? "" : "",
            timestamp: "Just now",
            isThinking: !isComplete,
            thinkingSteps: steps,
          }

          if (existingThinkingIndex >= 0) {
            // Update existing thinking message
            const newMessages = [...conv.messages]
            newMessages[existingThinkingIndex] = thinkingMessage
            return {
              ...conv,
              messages: newMessages,
            }
          } else {
            // Add new thinking message
            return {
              ...conv,
              messages: [...conv.messages, thinkingMessage],
            }
          }
        }
        return conv
      })
    )
  }

  // Handle webuy.com search with form filling
  const handleWebuySearch = async (userRequest: string, convId: string, requestData?: RequestData) => {
    setIsScraping(true)
    
    try {
      // Get context from conversation if available, or use passed requestData
      const currentConv = conversations.find((c) => c.id === convId)
      const requestContext = requestData || currentConv?.requestData
      const context = requestContext
        ? `Item Information: ${requestContext.itemInformation}, CR Rate: ${requestContext.crRate}, Type: ${requestContext.type}, Customer Expectation: ${requestContext.customerExpectation}`
        : undefined

      // Step 1: Generate search term
      updateThinkingMessage(convId, ["Generating search term from your request..."])
      const searchTerm = await generateSearchTerm(userRequest, context)
      updateThinkingMessage(convId, [
        "Generating search term from your request...",
        `Generated search term: "${searchTerm}"`
      ])

      // Step 2: Navigate to webuy.com
      updateThinkingMessage(convId, [
        "Generating search term from your request...",
        `Generated search term: "${searchTerm}"`,
        "Navigating to uk.webuy.com..."
      ])

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
          extractImages: true,
          fillForm: [
            {
              selector: "#predictiveSearchText",
              value: searchTerm,
              triggerChange: true,
            },
          ],
        }),
      })

      // Step 3: Show typing/searching message
      updateThinkingMessage(convId, [
        "Generating search term from your request...",
        `Generated search term: "${searchTerm}"`,
        "Navigating to uk.webuy.com...",
        `Typing "${searchTerm}" into search field...`
      ])

      const result = await response.json()

      // Update the thinking message with final results (keep thinking panel, mark as complete)
      const finalSteps = [
        "Generating search term from your request...",
        `Generated search term: "${searchTerm}"`,
        "Navigating to uk.webuy.com...",
        `Typing "${searchTerm}" into search field...`,
        result.success ? "Extracting results..." : "Error occurred"
      ]

      // Generate first refinement question if we have products
      let firstQuestion: any = null
      if (result.success && result.products && result.products.length > 1) {
        updateThinkingMessage(convId, [
          ...finalSteps,
          "Analyzing products to generate refinement question..."
        ])
        
        try {
          const questionsResponse = await fetch("/api/ai-tooling", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              task: "generate_refinement_questions",
              input: {
                products: result.products.map((p: any) => ({
                  title: p.title, // Title for question generation
                  price: p.price, // Price for determining if questions are needed
                })),
                previousQuestions: [],
                previousAnswers: {},
                requestContext: requestContext?.itemInformation || undefined, // Pass original request to avoid asking about already-specified features
              },
            }),
          })
          
          const questionsResult = await questionsResponse.json()
          console.log("Questions API response:", questionsResult)
          if (questionsResult.success && questionsResult.result?.question) {
            firstQuestion = questionsResult.result.question
            // Generate unique ID for this question
            firstQuestion.id = `question_${Date.now()}`
            console.log("Generated first question:", firstQuestion)
          } else if (questionsResult.success && questionsResult.result?.question === null) {
            console.log("AI determined no question needed (all products have same price or can be identified)")
          } else {
            console.warn("No question in response:", questionsResult)
          }
        } catch (e) {
          console.error("Failed to generate refinement question:", e)
        }
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            // Find and update the thinking message with results
            const updatedMessages = conv.messages.map((msg) => {
              if (msg.isThinking === true) {
                return {
                  ...msg,
                  isThinking: false, // Mark as complete but keep the steps
                  thinkingSteps: finalSteps,
                  content: result.success
                    ? `Successfully searched uk.webuy.com for "${searchTerm}". Here's what I found:`
                    : `I encountered an error while searching: ${result.error}`,
                  scrapeResult: result,
                  refinementQuestions: firstQuestion ? [firstQuestion] : undefined,
                  refinementAnswers: {},
                }
              }
              return msg
            })

            return {
              ...conv,
              messages: updatedMessages,
              lastMessage: result.success
                ? `Searched: ${searchTerm}`
                : `Search failed: ${searchTerm}`,
            }
          }
          return conv
        })
      )
    } catch (error: any) {
      // Update thinking message with error
      const errorSteps = [
        "Generating search term from your request...",
        "Error occurred during processing"
      ]

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            // Find and update the thinking message with error
            const updatedMessages = conv.messages.map((msg) => {
              if (msg.isThinking === true) {
                return {
                  ...msg,
                  isThinking: false, // Mark as complete but keep the steps
                  thinkingSteps: errorSteps,
                  content: `Error: ${error.message || "Failed to search uk.webuy.com"}`,
                }
              }
              return msg
            })

            return {
              ...conv,
              messages: updatedMessages,
            }
          }
          return conv
        })
      )
    } finally {
      setIsScraping(false)
    }
  }

  // Handle refinement question answers - filter products and generate next question
  const handleRefinementAnswer = async (messageId: string, questionId: string, answer: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        const updatedMessages = conv.messages.map((msg) => {
          if (msg.id === messageId && msg.scrapeResult?.products) {
            const currentAnswers = { ...(msg.refinementAnswers || {}), [questionId]: answer }
            // Remove the answer if it's empty (cleared)
            if (!answer || answer.trim() === '') {
              delete currentAnswers[questionId]
            }
            
            // Filter products based on all answers
            let filtered = [...(msg.scrapeResult.products || [])]
            
            // Apply filtering based on answers
            Object.entries(currentAnswers).forEach(([qId, ans]) => {
              if (!ans || ans.trim() === '') return
              
              const question = msg.refinementQuestions?.find((q: any) => q.id === qId)
              if (question) {
                const answerLabel = question.options.find((opt: any) => opt.value === ans)?.label || ans
                const normalizedAnswer = answerLabel.toLowerCase().replace(/[^a-z0-9]/g, '')
                
                filtered = filtered.filter((product: any) => {
                  const title = (product.title || '').toLowerCase()
                  // Try multiple matching strategies
                  // 1. Direct word match
                  const answerWords = normalizedAnswer.split(/\s+/).filter((w: string) => w.length > 2)
                  const hasWordMatch = answerWords.some((word: string) => title.includes(word))
                  
                  // 2. Check if answer label appears in title
                  const hasLabelMatch = title.includes(answerLabel.toLowerCase())
                  
                  // 3. For condition questions, check for keywords
                  if (question.question.toLowerCase().includes('condition')) {
                    const conditionKeywords: Record<string, string[]> = {
                      'boxed': ['boxed', 'box'],
                      'unboxed': ['unboxed', 'no box'],
                      'discounted': ['discounted'],
                      'refurbished': ['refurbished', 'refurb'],
                      'used': ['used'],
                      'new': ['new'],
                    }
                    const answerKey = answerLabel.toLowerCase()
                    const keywords = conditionKeywords[answerKey] || [answerKey]
                    return keywords.some(keyword => title.includes(keyword))
                  }
                  
                  return hasWordMatch || hasLabelMatch
                })
              }
            })
            
            // Generate next question if we still have multiple products
            let newQuestions = [...(msg.refinementQuestions || [])]
            if (filtered.length > 1 && answer && answer.trim() !== '') {
              // Generate next question based on filtered products (async)
              setTimeout(async () => {
                try {
                  // First, do a sanity check: check if another question is actually needed
                  const sanityCheckResponse = await fetch("/api/ai-tooling", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      task: "generate_refinement_questions",
                      input: {
                        products: filtered.map((p: any) => ({
                          title: p.title,
                          price: p.price,
                        })),
                        previousQuestions: msg.refinementQuestions || [],
                        previousAnswers: currentAnswers,
                        requestContext: conv.requestData?.itemInformation || undefined,
                        sanityCheck: true, // Flag for sanity check mode
                      },
                    }),
                  })
                  
                  const sanityResult = await sanityCheckResponse.json()
                  
                  // Only proceed if sanity check says a question is needed
                  if (sanityResult.success && sanityResult.result?.question === "needed") {
                    // Now generate the actual question
                    const questionsResponse = await fetch("/api/ai-tooling", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        task: "generate_refinement_questions",
                        input: {
                          products: filtered.map((p: any) => ({
                            title: p.title, // Title for question generation
                            price: p.price, // Price for determining if questions are needed
                          })),
                          previousQuestions: msg.refinementQuestions || [],
                          previousAnswers: currentAnswers,
                          requestContext: conv.requestData?.itemInformation || undefined, // Pass original request context
                        },
                      }),
                    })
                  
                    const questionsResult = await questionsResponse.json()
                    if (questionsResult.success) {
                      // Check if AI returned null (no question needed)
                      if (questionsResult.result?.question === null) {
                        console.log("AI determined no more questions needed")
                        return // Stop asking questions
                      }
                      
                      if (questionsResult.result?.question) {
                        const nextQuestion = questionsResult.result.question
                        nextQuestion.id = `question_${Date.now()}`
                        
                        setConversations((prevConv) =>
                          prevConv.map((prevC) => {
                            if (prevC.id === conv.id) {
                              return {
                                ...prevC,
                                messages: prevC.messages.map((m) => {
                                  if (m.id === messageId) {
                                    // Check if this question is similar to existing ones
                                    const isDuplicate = m.refinementQuestions?.some((q: any) => {
                                      // Exact match
                                      if (q.question === nextQuestion.question) return true
                                      
                                      // Similar question check (normalize and compare)
                                      const normalize = (text: string) => text.toLowerCase()
                                        .replace(/[^a-z0-9\s]/g, '')
                                        .replace(/\s+/g, ' ')
                                        .trim()
                                      
                                      const existingNormalized = normalize(q.question)
                                      const newNormalized = normalize(nextQuestion.question)
                                      
                                      // Check for similar keywords
                                      const existingKeywords = existingNormalized.split(' ')
                                        .filter(w => w.length > 3)
                                      const newKeywords = newNormalized.split(' ')
                                        .filter(w => w.length > 3)
                                      
                                      // If they share key words like "condition", "color", "phone", etc., it's likely a duplicate
                                      const sharedKeywords = existingKeywords.filter(k => 
                                        newKeywords.includes(k) && 
                                        ['condition', 'color', 'colour', 'phone', 'device', 'item', 'product', 'iphone'].includes(k)
                                      )
                                      
                                      // If question is about condition and we already asked about condition
                                      if (existingNormalized.includes('condition') && 
                                          newNormalized.includes('condition')) {
                                        return true
                                      }
                                      
                                      // If question is about color and we already asked about color (any variation)
                                      if ((existingNormalized.includes('color') || existingNormalized.includes('colour')) && 
                                          (newNormalized.includes('color') || newNormalized.includes('colour'))) {
                                        return true
                                      }
                                      
                                      // If both questions are asking about the same feature (e.g., both have "color" or both have "condition")
                                      if (sharedKeywords.length > 0) {
                                        return true
                                      }
                                      
                                      return false
                                    })
                                    
                                    if (!isDuplicate) {
                                      return {
                                        ...m,
                                        refinementQuestions: [...(m.refinementQuestions || []), nextQuestion],
                                      }
                                    } else {
                                      console.warn("Duplicate question detected, skipping:", nextQuestion.question)
                                    }
                                  }
                                  return m
                                }),
                              }
                            }
                            return prevC
                          })
                        )
                      }
                    }
                  }
                } catch (e) {
                  console.error("Failed to generate next question:", e)
                }
              }, 100)
            }
            
            return {
              ...msg,
              refinementAnswers: currentAnswers,
            }
          }
          return msg
        })

        return {
          ...conv,
          messages: updatedMessages,
        }
      })
    )
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

    // Build user message content - include request information if available
    let userMessageContent = content
    if (currentConv?.requestData) {
      userMessageContent = `Request Information:
- Item Information: ${currentConv.requestData.itemInformation}
- CR Rate: ${currentConv.requestData.crRate}
- Type: ${currentConv.requestData.type.toUpperCase()}
- Customer Expectation: ${currentConv.requestData.customerExpectation}

User Request: ${content}`
    }

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessageContent,
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
        // Format messages for API (include all previous messages + new user message)
        // Note: request context is already included in the user message content
        const apiMessages = [
          ...previousMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user",
            content: userMessageContent,
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
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onRefinementAnswer={handleRefinementAnswer}
                  />
                ))}
                {isTyping && (
                  <div className="w-full border-b border-gray-800/50 bg-[#212121]">
                    <div className="mx-auto max-w-3xl px-4 py-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-[#10A37F]">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-400 text-sm">
                            Thinking...
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
