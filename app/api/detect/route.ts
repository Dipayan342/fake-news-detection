import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { default as OpenAI } from "openai"

// Dynamically import OpenAI only when needed
let openai: any = null

async function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true, // Add this option to allow browser-like environments
      })
    } catch (error) {
      console.error("Failed to initialize OpenAI:", error)
      return null
    }
  }
  return openai
}

function parseCSV(csvContent: string) {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return []

    // Handle different CSV formats
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Simple CSV parsing - handle quoted values
        const values = []
        let current = ""
        let inQuotes = false

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim()) // Add the last value

        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    return data
  } catch (error) {
    console.error("Error parsing CSV:", error)
    return []
  }
}

async function analyzeNewsWithAI(text: string) {
  try {
    const client = await getOpenAIClient()
    if (!client) {
      throw new Error("OpenAI client not available")
    }

    const prompt = `
    Analyze the following news article for credibility and determine if it might be fake news.
    
    Article: "${text}"
    
    Provide a detailed analysis with the following:
    1. Credibility score (0-100, where 0 is definitely fake and 100 is definitely credible)
    2. Credibility level (low, medium, or high)
    3. Status (likely-fake, questionable, or likely-real)
    4. List of suspicious elements or red flags (if any)
    5. List of credibility indicators (if any)
    6. Word count
    
    Format your response as a JSON object with the following structure:
    {
      "score": number,
      "credibility": "low" | "medium" | "high",
      "status": "likely-fake" | "questionable" | "likely-real",
      "fakeKeywordsFound": number,
      "reliableIndicatorsFound": number,
      "analysis": {
        "textLength": number,
        "suspiciousKeywords": string[],
        "reliableIndicators": string[]
      }
    }
    
    Only respond with the JSON object, no other text.
    `

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert fact-checker and journalist who specializes in detecting fake news.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    // Validate the response structure
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error("Invalid response structure from OpenAI:", response)
      throw new Error("Invalid response from OpenAI")
    }

    const content = response.choices[0].message.content
    if (!content) {
      console.error("Empty content in OpenAI response")
      throw new Error("Empty content in OpenAI response")
    }

    try {
      const result = JSON.parse(content)

      // Validate the parsed result has the expected structure
      if (!result.score || !result.credibility || !result.status || !result.analysis) {
        console.error("Invalid result structure:", result)
        throw new Error("Invalid result structure")
      }

      return result
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError, "Content:", content)
      throw new Error("Failed to parse OpenAI response")
    }
  } catch (error) {
    console.error("Error analyzing with AI:", error)
    throw error
  }
}

// Fallback analysis function if AI fails
function fallbackAnalysis(text: string) {
  if (!text) {
    console.error("Empty text provided to fallbackAnalysis")
    text = "" // Ensure text is at least an empty string
  }

  const fakeNewsKeywords = [
    "breaking",
    "shocking",
    "unbelievable",
    "secret",
    "exposed",
    "leaked",
    "exclusive",
    "bombshell",
    "scandal",
    "conspiracy",
    "hoax",
    "fake",
    "lies",
    "cover-up",
    "hidden truth",
    "they don't want you to know",
  ]

  const reliableSourceIndicators = [
    "according to",
    "research shows",
    "study finds",
    "experts say",
    "data indicates",
    "official statement",
    "confirmed by",
    "verified",
  ]

  const lowerText = text.toLowerCase()

  // Count suspicious keywords
  const fakeKeywordCount = fakeNewsKeywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length

  // Count reliable indicators
  const reliableIndicatorCount = reliableSourceIndicators.filter((indicator) =>
    lowerText.includes(indicator.toLowerCase()),
  ).length

  // Simple scoring algorithm
  const suspiciousScore = fakeKeywordCount * 10 - reliableIndicatorCount * 5
  const textLength = text.split(" ").length

  // Adjust score based on text length
  const normalizedScore = Math.max(0, Math.min(100, suspiciousScore + (textLength < 50 ? 20 : 0)))

  let credibility: "high" | "medium" | "low"
  let status: "likely-real" | "questionable" | "likely-fake"

  if (normalizedScore < 30) {
    credibility = "high"
    status = "likely-real"
  } else if (normalizedScore < 60) {
    credibility = "medium"
    status = "questionable"
  } else {
    credibility = "low"
    status = "likely-fake"
  }

  return {
    score: normalizedScore,
    credibility,
    status,
    fakeKeywordsFound: fakeKeywordCount,
    reliableIndicatorsFound: reliableIndicatorCount,
    analysis: {
      textLength,
      suspiciousKeywords: fakeNewsKeywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())),
      reliableIndicators: reliableSourceIndicators.filter((indicator) => lowerText.includes(indicator.toLowerCase())),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    if (text.length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters long" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    const useAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0

    let result
    let aiPowered = false

    if (useAI) {
      try {
        result = await analyzeNewsWithAI(text)
        aiPowered = true
      } catch (error) {
        console.error("AI analysis failed, falling back to basic analysis:", error)
        result = fallbackAnalysis(text)
        aiPowered = false
      }
    } else {
      result = fallbackAnalysis(text)
    }

    return NextResponse.json({
      success: true,
      result,
      aiPowered,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error analyzing text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const projectRoot = process.cwd()
    const csvFiles = ["fake.csv", "real.csv", "manual_testing.csv"]
    const newsData: any = {}

    for (const fileName of csvFiles) {
      try {
        const filePath = path.join(projectRoot, fileName)
        console.log(`Checking for file: ${filePath}`)

        if (fs.existsSync(filePath)) {
          console.log(`Reading file: ${fileName}`)
          const csvContent = fs.readFileSync(filePath, "utf-8")
          const parsedData = parseCSV(csvContent)
          newsData[fileName.replace(".csv", "")] = parsedData
          console.log(`Successfully parsed ${parsedData.length} rows from ${fileName}`)
        } else {
          console.log(`File not found: ${fileName}`)
          newsData[fileName.replace(".csv", "")] = []
        }
      } catch (error) {
        console.error(`Error reading ${fileName}:`, error)
        newsData[fileName.replace(".csv", "")] = []
      }
    }

    console.log(
      "CSV data loaded:",
      Object.keys(newsData).map((key) => `${key}: ${newsData[key].length} items`),
    )

    return NextResponse.json({
      success: true,
      data: newsData,
      message: "CSV data loaded successfully",
    })
  } catch (error) {
    console.error("Error reading CSV files:", error)
    return NextResponse.json(
      {
        error: "Failed to read CSV files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
