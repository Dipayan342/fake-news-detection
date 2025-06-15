"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Zap,
  ArrowLeft,
  Home,
  FileText,
  Database,
  Settings,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

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

interface NewsItem {
  [key: string]: string
}

interface CSVData {
  fake: NewsItem[]
  real: NewsItem[]
  manual_testing: NewsItem[]
}

export default function FakeNewsDetector() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [selectedNews, setSelectedNews] = useState<string>("")
  const [loadingCSV, setLoadingCSV] = useState(true)
  const [csvError, setCsvError] = useState("")
  const [aiPowered, setAiPowered] = useState(false)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)

  useEffect(() => {
    loadCSVData()
    // Check if API key is configured
    const storedKey = localStorage.getItem("openai_api_key") || ""
    setApiKeyConfigured(storedKey.length > 0)
  }, [])

  const loadCSVData = async () => {
    try {
      setLoadingCSV(true)
      setCsvError("")

      const response = await fetch("/api/detect", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()

      if (data.success) {
        setCsvData(data.data)
        console.log("CSV data loaded successfully:", data.data)
      } else {
        throw new Error(data.error || "Failed to load CSV data")
      }
    } catch (error) {
      console.error("Error loading CSV data:", error)
      setCsvError(error instanceof Error ? error.message : "Failed to load CSV data")
      // Set empty data so the UI doesn't break
      setCsvData({
        fake: [],
        real: [],
        manual_testing: [],
      })
    } finally {
      setLoadingCSV(false)
    }
  }

  const handleDatasetChange = (dataset: string) => {
    setSelectedDataset(dataset)
    setSelectedNews("")
    setText("")
  }

  const handleNewsSelection = (newsIndex: string) => {
    setSelectedNews(newsIndex)
    if (csvData && selectedDataset && newsIndex) {
      const newsItem = csvData[selectedDataset as keyof CSVData][Number.parseInt(newsIndex)]
      if (newsItem) {
        // Try to find a text field in the CSV data
        const textFields = ["text", "content", "article", "news", "title", "headline", "body", "description"]
        let newsText = ""

        for (const field of textFields) {
          if (newsItem[field] && newsItem[field].trim()) {
            newsText = newsItem[field]
            break
          }
        }

        // If no specific text field found, combine all fields
        if (!newsText) {
          newsText = Object.values(newsItem)
            .filter((value) => value && value.trim())
            .join(" ")
        }

        setText(newsText)
      }
    }
  }

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze text")
      }

      setResult(data.result)
      setAiPowered(data.aiPowered || false)
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>

        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header with Navigation */}
      <div className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/intro">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">TruthGuard AI</h1>
                  <p className="text-sm text-gray-300">Fake News Detector</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/intro">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* API Key Alert */}
        {!apiKeyConfigured && (
          <Alert className="mb-6 border-yellow-400/50 bg-yellow-500/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200 flex-1">
              OpenAI API key not configured. The detector will use basic analysis instead of AI.
            </AlertDescription>
            <Link href="/settings">
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-400/50 text-yellow-200 hover:bg-yellow-500/20"
              >
                Configure API Key
              </Button>
            </Link>
          </Alert>
        )}

        {/* CSV Data Selection Card */}
        <Card className="mb-8 shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader className="text-center bg-gradient-to-r from-white/5 to-white/10 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Database className="w-6 h-6" />
              Select News from Dataset
              <Button
                onClick={loadCSVData}
                size="sm"
                variant="ghost"
                className="ml-auto text-white hover:bg-white/10"
                disabled={loadingCSV}
              >
                <RefreshCw className={`w-4 h-4 ${loadingCSV ? "animate-spin" : ""}`} />
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-200">
              Choose from your CSV files: fake.csv, real.csv, or manual_testing.csv
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {loadingCSV ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
                <p className="text-gray-300">Loading CSV data...</p>
              </div>
            ) : csvError ? (
              <Alert className="border-red-400/50 bg-red-500/10 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  Error loading CSV files: {csvError}
                  <br />
                  <span className="text-sm">
                    Make sure fake.csv, real.csv, and manual_testing.csv are in your project root directory.
                  </span>
                </AlertDescription>
              </Alert>
            ) : csvData ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Select Dataset</label>
                  <Select value={selectedDataset} onValueChange={handleDatasetChange}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Choose a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fake">Fake News Dataset ({csvData.fake?.length || 0} items)</SelectItem>
                      <SelectItem value="real">Real News Dataset ({csvData.real?.length || 0} items)</SelectItem>
                      <SelectItem value="manual_testing">
                        Manual Testing Dataset ({csvData.manual_testing?.length || 0} items)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Select News Article</label>
                  <Select value={selectedNews} onValueChange={handleNewsSelection} disabled={!selectedDataset}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Choose an article" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDataset &&
                        csvData[selectedDataset as keyof CSVData]?.map((item, index) => {
                          const preview = Object.values(item)[0]?.substring(0, 50) || `Item ${index + 1}`
                          return (
                            <SelectItem key={index} value={index.toString()}>
                              Article {index + 1}: {preview}...
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Main Input Card */}
        <Card className="mb-8 shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader className="text-center bg-gradient-to-r from-white/5 to-white/10 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <FileText className="w-8 h-8" />
              Analyze News Credibility
              {apiKeyConfigured && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-200 border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-lg text-gray-200">
              Paste any news article or select from your datasets to check credibility using AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <label htmlFor="news-text" className="text-sm font-medium text-gray-200">
                News Text or Article
              </label>
              <Textarea
                id="news-text"
                placeholder="Paste your news article or text here, or select from the dataset above..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none border-2 border-white/20 bg-white/5 text-white placeholder:text-gray-400 focus:border-blue-400 transition-colors backdrop-blur-sm"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{text.length} characters</span>
                <span>Minimum 10 characters required</span>
              </div>
            </div>

            {error && (
              <Alert className="border-red-400/50 bg-red-500/10 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={analyzeText}
              disabled={loading || text.length < 10}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Analyze News
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results with enhanced styling */}
        {result && (
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="bg-gradient-to-r from-white/5 to-white/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-white">
                {getStatusIcon(result.status)}
                Analysis Results
                <div className="flex ml-auto gap-2">
                  {aiPowered && (
                    <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Analysis
                    </Badge>
                  )}
                  {selectedDataset && (
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                      From: {selectedDataset}.csv
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {/* Main Status with enhanced design */}
              <div className="text-center p-8 rounded-xl bg-gradient-to-r from-black/20 to-black/30 backdrop-blur-sm border border-white/10">
                <div
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl ${getStatusColor(result.status)}`}
                >
                  {getStatusIcon(result.status)}
                  {result.status.replace("-", " ").toUpperCase()}
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-bold text-white">{result.score}%</div>
                  <div className="text-gray-300">Suspicion Score</div>
                </div>
              </div>

              {/* Credibility Meter with glow effect */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-gray-200">
                  <span>Credibility Level</span>
                  <span className="capitalize">{result.credibility}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 shadow-lg ${
                      result.credibility === "high"
                        ? "bg-gradient-to-r from-green-400 to-green-600 shadow-green-500/50"
                        : result.credibility === "medium"
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-yellow-500/50"
                          : "bg-gradient-to-r from-red-400 to-red-600 shadow-red-500/50"
                    }`}
                    style={{
                      width: `${result.credibility === "high" ? 85 : result.credibility === "medium" ? 50 : 20}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Analysis Details with enhanced cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 p-6 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                  <h3 className="font-semibold text-red-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Suspicious Elements
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">Suspicious Keywords</span>
                      <Badge variant={result.fakeKeywordsFound > 0 ? "destructive" : "secondary"}>
                        {result.fakeKeywordsFound}
                      </Badge>
                    </div>
                    {result.analysis.suspiciousKeywords && result.analysis.suspiciousKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.analysis.suspiciousKeywords.map((keyword, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No suspicious keywords found</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-6 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                  <h3 className="font-semibold text-green-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Credibility Indicators
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">Reliable Indicators</span>
                      <Badge variant={result.reliableIndicatorsFound > 0 ? "default" : "secondary"}>
                        {result.reliableIndicatorsFound}
                      </Badge>
                    </div>
                    {result.analysis.reliableIndicators && result.analysis.reliableIndicators.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.analysis.reliableIndicators.map((indicator, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No reliable indicators found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Stats with enhanced design */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/20">
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white">{result.analysis.textLength}</div>
                  <div className="text-sm text-gray-300">Words</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-red-400">{result.fakeKeywordsFound}</div>
                  <div className="text-sm text-gray-300">Red Flags</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-400">{result.reliableIndicatorsFound}</div>
                  <div className="text-sm text-gray-300">Trust Signals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards with enhanced styling */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-green-500/10 backdrop-blur-sm border border-green-500/20 hover:bg-green-500/15 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-green-200 mb-2">Likely Real</h3>
              <p className="text-sm text-green-300">Contains credible sources and factual language</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 hover:bg-yellow-500/15 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-yellow-200 mb-2">Questionable</h3>
              <p className="text-sm text-yellow-300">Requires additional verification and fact-checking</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-red-500/10 backdrop-blur-sm border border-red-500/20 hover:bg-red-500/15 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-red-200 mb-2">Likely Fake</h3>
              <p className="text-sm text-red-300">Contains suspicious patterns and misleading language</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
