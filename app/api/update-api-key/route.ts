import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // In a real application, you would securely store this key
    // For this demo, we'll just set it in memory
    // This is NOT secure and should NOT be used in production
    process.env.OPENAI_API_KEY = apiKey

    return NextResponse.json({
      success: true,
      message: "API key updated successfully",
    })
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
