"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, CheckCircle, Search } from "lucide-react"

interface AnalysisResult {
  score: number
  credibility: "high" | "medium" | "low"
  status: "likely-real" | "questionable" | "likely-fake"
  fakeKeywordsFound: number
  reliableIndicatorsFound: number
  analysis: {
    textLength: number
    suspiciousKeywords: string[]
    reliableIndicators: string[]
  }
}

export default function FakeNewsDetector() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    router.push("/intro")
  }, [router])

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text")
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "likely-real":
        return "bg-green-500"
      case "questionable":
        return "bg-yellow-500"
      case "likely-fake":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "likely-real":
        return <CheckCircle className="w-5 h-5" />
      case "questionable":
        return <AlertTriangle className="w-5 h-5" />
      case "likely-fake":
        return <Shield className="w-5 h-5" />
      default:
        return <Search className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading TruthGuard AI...</p>
      </div>
    </div>
  )
}
