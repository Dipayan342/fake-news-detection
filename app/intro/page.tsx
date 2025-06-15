"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Target, ArrowRight, Sparkles, Brain, Search } from "lucide-react"
import Link from "next/link"

export default function IntroPage() {
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { number: "73%", label: "of people share news without reading" },
    { number: "6x", label: "faster fake news spreads than real news" },
    { number: "3.8B", label: "people affected by misinformation daily" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TruthGuard AI</span>
          </div>
          <Link href="/detector">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Try Detector
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Truth Detection
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Stop{" "}
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Fake News</span>
            <br />
            Before It{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Spreads</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Harness the power of artificial intelligence to instantly detect misinformation, verify news credibility,
            and protect yourself from fake news in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/detector">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Detecting Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Learn How It Works
            </Button>
          </div>

          {/* Dynamic Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{stats[currentStat].number}</div>
              <div className="text-gray-300">{stats[currentStat].label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose TruthGuard AI?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Advanced AI algorithms trained on millions of articles to give you instant, accurate results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI-Powered Analysis</h3>
                <p className="text-gray-300">
                  Advanced machine learning algorithms analyze text patterns, sources, and linguistic markers to detect
                  misinformation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Instant Results</h3>
                <p className="text-gray-300">
                  Get credibility scores and detailed analysis in seconds. No waiting, no delays - just immediate
                  insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">High Accuracy</h3>
                <p className="text-gray-300">
                  Trained on extensive datasets of verified fake and real news to ensure maximum accuracy in detection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-300 text-lg">Simple, fast, and accurate in just three steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Paste Your Text</h3>
            <p className="text-gray-300">
              Copy and paste any news article, social media post, or text you want to verify.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">AI Analysis</h3>
            <p className="text-gray-300">
              Our AI analyzes language patterns, sources, and credibility indicators in real-time.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Get Results</h3>
            <p className="text-gray-300">
              Receive detailed credibility scores, risk assessment, and explanation of findings.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Fight Misinformation?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust TruthGuard AI to verify news and protect against fake information.
          </p>
          <Link href="/detector">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6 h-auto"
            >
              <Shield className="w-5 h-5 mr-2" />
              Start Detecting Fake News
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TruthGuard AI</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <span>© 2024 TruthGuard AI</span>
              <span>•</span>
              <span>Fighting misinformation with AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
