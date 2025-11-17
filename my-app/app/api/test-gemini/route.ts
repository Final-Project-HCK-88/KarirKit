import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    console.log("\n🧪 === TESTING GEMINI API ===");

    // Check API key
    const apiKey = process.env.Gemini_API_Key?.trim();
    console.log("🔑 API Key exists:", !!apiKey);
    console.log("🔑 API Key length:", apiKey?.length || 0);
    console.log("🔑 API Key first 10 chars:", apiKey?.substring(0, 10));

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API Key not found in environment variables",
          envVars: Object.keys(process.env).filter((k) => k.includes("Gemini")),
        },
        { status: 500 }
      );
    }

    // Try to initialize Gemini
    console.log("🤖 Initializing Gemini AI...");
    const client = new GoogleGenAI({ apiKey });

    console.log("✅ Gemini AI initialized");

    // Try simple request
    console.log("📤 Sending test request to Gemini...");
    const prompt =
      'Say \'Hello, Gemini is working!\' in JSON format: {"message": "..."}';

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const text = response.text;

    console.log("✅ Gemini response received");
    console.log("📥 Response:", text);

    return NextResponse.json(
      {
        success: true,
        message: "Gemini API is working!",
        response: text,
        apiKeyLength: apiKey.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ === GEMINI TEST FAILED ===");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("Error type:", err?.constructor?.name);
    console.error("Error message:", err?.message);
    console.error("Error status:", err?.status);
    console.error("Error response:", err?.response?.data);
    console.error("Full error:", JSON.stringify(err, null, 2));

    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(error),
        errorType: err?.constructor?.name,
        status: err?.status,
        details: err?.response?.data || err?.cause,
      },
      { status: 500 }
    );
  }
}
