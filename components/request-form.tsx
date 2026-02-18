"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface RequestData {
  itemInformation: string
  crRate: string
  type: "bb" | "dp"
  customerExpectation: string
}

interface RequestFormProps {
  onSubmit: (data: RequestData) => void
}

export function RequestForm({ onSubmit }: RequestFormProps) {
  const [itemInformation, setItemInformation] = useState("")
  const [crRate, setCrRate] = useState("")
  const [type, setType] = useState<"bb" | "dp">("bb")
  const [customerExpectation, setCustomerExpectation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemInformation.trim() && crRate.trim() && customerExpectation.trim()) {
      onSubmit({
        itemInformation,
        crRate,
        type,
        customerExpectation,
      })
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="rounded-lg border border-gray-700 bg-[#212121] p-8">
          <h2 className="text-2xl font-semibold text-white mb-8">
            New Request Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Item Information */}
          <div className="space-y-3">
            <Label htmlFor="itemInformation" className="text-white text-base font-medium">
              Item Information
            </Label>
            <Input
              id="itemInformation"
              value={itemInformation}
              onChange={(e) => setItemInformation(e.target.value)}
              placeholder="Enter item information..."
              className="bg-[#40414f] border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500 h-12 text-base"
              required
            />
          </div>

          {/* CR Rate */}
          <div className="space-y-3">
            <Label htmlFor="crRate" className="text-white text-base font-medium">
              CR Rate
            </Label>
            <Input
              id="crRate"
              type="number"
              step="0.01"
              value={crRate}
              onChange={(e) => setCrRate(e.target.value)}
              placeholder="Enter CR rate..."
              className="bg-[#40414f] border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500 h-12 text-base"
              required
            />
          </div>

          {/* Type Toggle (BB/DP) */}
          <div className="space-y-3">
            <Label className="text-white text-base font-medium">Type</Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-base font-medium",
                    type === "bb" ? "text-white" : "text-gray-400"
                  )}
                >
                  BB
                </span>
                <Switch
                  checked={type === "dp"}
                  onCheckedChange={(checked) => setType(checked ? "dp" : "bb")}
                  className="scale-125"
                />
                <span
                  className={cn(
                    "text-base font-medium",
                    type === "dp" ? "text-white" : "text-gray-400"
                  )}
                >
                  DP
                </span>
              </div>
              <div className="flex-1">
                <span className="text-base text-gray-400">
                  Current selection: <span className="text-white font-medium">{type.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Customer Expectation */}
          <div className="space-y-3">
            <Label htmlFor="customerExpectation" className="text-white text-base font-medium">
              Customer Expectation
            </Label>
            <Input
              id="customerExpectation"
              value={customerExpectation}
              onChange={(e) => setCustomerExpectation(e.target.value)}
              placeholder="Enter customer expectation..."
              className="bg-[#40414f] border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-500 h-12 text-base"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#10A37F] hover:bg-[#0d8f6e] text-white h-12 text-base font-medium"
            disabled={!itemInformation.trim() || !crRate.trim() || !customerExpectation.trim()}
          >
            Start Request
          </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
