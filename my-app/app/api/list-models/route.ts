import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    console.log("\n📋 === LISTING GEMINI MODELS ===");

    const apiKey = process.env.Gemini_API_Key?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key not found" },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    console.log("🔍 Fetching available models...");

    // List all available models
    const modelsPager = await client.models.list();

    // Convert pager to array
    const models = [];
    for await (const model of modelsPager) {
      models.push(model);
    }

    console.log("✅ Models retrieved successfully");
    console.log("📊 Total models:", models.length);

    return NextResponse.json(
      {
        success: true,
        totalModels: models.length,
        models: models.map((model) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
        })),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ === LIST MODELS FAILED ===");
    console.error("Error:", error);

    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(error),
        errorType: err?.constructor?.name,
      },
      { status: 500 }
    );
  }
}
