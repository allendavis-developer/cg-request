"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Model {
  id: string
  name: string
  description?: string
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onSelectModel: (modelId: string) => void
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const selected = models.find((m) => m.id === selectedModel) || models[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
        >
          {selected.name}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 bg-[#171717] border-gray-700/50"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={cn(
              "text-white hover:bg-gray-800 cursor-pointer",
              selectedModel === model.id && "bg-gray-800"
            )}
          >
            <div className="flex flex-col">
              <span className="text-sm">{model.name}</span>
              {model.description && (
                <span className="text-xs text-gray-400">{model.description}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
