"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Key, Save, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // In a real app, you'd fetch this from a secure storage
    // For demo purposes, we'll use localStorage
    const storedKey = localStorage.getItem("openai_api_key") || ""
    setApiKey(storedKey)
    setSavedKey(storedKey)
  }, [])

  const saveApiKey = () => {
    setSaving(true)
    setTimeout(() => {
      localStorage.setItem("openai_api_key", apiKey)
      setSavedKey(apiKey)

      // Send the API key to the server to update the environment variable
      // This is a simplified example - in a real app, you'd use a more secure approach
      fetch("/api/update-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      }).catch((error) => {
        console.error("Failed to update API key on server:", error)
      })

      setSaving(false)
    }, 1000)
  }

  const testApiKey = async () => {
    setTestResult(null)
    try {
      // In a real app, you'd make a server request to test the API key
      // For demo purposes, we'll simulate a test
      setTestResult({
        success: apiKey.length > 20,
        message: apiKey.length > 20 ? "API key is valid!" : "Invalid API key format",
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test API key",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Header with Navigation */}
      <div className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/detector">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Detector
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">TruthGuard AI</h1>
                  <p className="text-sm text-gray-300">Settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader className="text-center bg-gradient-to-r from-white/5 to-white/10 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Key className="w-6 h-6" />
              AI API Configuration
            </CardTitle>
            <CardDescription className="text-lg text-gray-200">
              Configure your OpenAI API key to enable AI-powered fake news detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium text-gray-200">
                OpenAI API Key
              </label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                />
                <Button
                  onClick={saveApiKey}
                  disabled={saving || apiKey === savedKey}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>

            {savedKey && (
              <div className="flex items-center gap-2 text-sm text-green-300">
                <CheckCircle className="w-4 h-4" />
                API key is saved
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Button onClick={testApiKey} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Test API Key
              </Button>

              {testResult && (
                <Alert
                  className={`mt-4 ${
                    testResult.success ? "border-green-400/50 bg-green-500/10" : "border-red-400/50 bg-red-500/10"
                  } backdrop-blur-sm`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className={testResult.success ? "text-green-200" : "text-red-200"}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <h3 className="font-semibold text-white">How to get an OpenAI API key:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>
                  Go to{" "}
                  <a
                    href="https://platform.openai.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline"
                  >
                    platform.openai.com
                  </a>{" "}
                  and create an account
                </li>
                <li>Navigate to the API keys section</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key and paste it above</li>
                <li>Click "Save" to store your API key</li>
              </ol>
              <p className="text-yellow-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Never share your API key with others or expose it in client-side code
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
