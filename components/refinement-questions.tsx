"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, X } from "lucide-react"

export interface QuestionOption {
  value: string
  label: string
}

export interface RefinementQuestion {
  id: string
  question: string
  options: QuestionOption[]
}

interface RefinementQuestionsProps {
  questions: RefinementQuestion[]
  onAnswer: (questionId: string, answer: string) => void
  answers: Record<string, string>
  className?: string
}

export function RefinementQuestions({
  questions,
  onAnswer,
  answers,
  className,
}: RefinementQuestionsProps) {
  const [expanded, setExpanded] = useState(true)

  if (!questions || questions.length === 0) {
    return null
  }

  return (
    <div className={cn("border border-gray-700/30 rounded overflow-hidden", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/20 transition-colors text-xs"
      >
        <span className="text-gray-400 font-medium">
          Refinement Questions ({questions.length})
        </span>
        {expanded ? (
          <ChevronUp className="h-3 w-3 text-gray-500" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 space-y-3">
          {questions.map((question, index) => {
            const selectedAnswer = answers[question.id]
            const isAnswered = selectedAnswer && selectedAnswer.trim() !== ''
            return (
              <div key={question.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-300">
                    {question.question}
                  </label>
                  {isAnswered && (
                    <span className="text-xs text-green-400">✓</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswer === option.value
                    return (
                      <div key={option.value} className="flex items-center gap-1">
                        <Button
                          onClick={() => onAnswer(question.id, option.value)}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-7 px-2 text-xs",
                            isSelected
                              ? "bg-[#10A37F] hover:bg-[#0d8a6d] text-white border-[#10A37F]"
                              : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border-gray-600"
                          )}
                        >
                          {option.label}
                        </Button>
                        {isSelected && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAnswer(question.id, "")
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
                            title="Clear selection"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Show separator after answered questions (except last) */}
                {isAnswered && index < questions.length - 1 && (
                  <div className="border-t border-gray-700/30 pt-2 mt-2" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
