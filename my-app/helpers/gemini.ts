import { GoogleGenAI } from "@google/genai";

// Bersihkan API key dari spasi
const apiKey = (process.env.Gemini_API_Key || "").replace(/\s+/g, "");

if (!apiKey) {
  console.error("⚠️ Gemini API Key is not configured");
}

const client = new GoogleGenAI({ apiKey });

export async function analyzeCVWithGemini(cvText: string) {
  try {
    if (!apiKey) {
      throw new Error(
        "Gemini API Key is not configured in environment variables"
      );
    }

    console.log("🤖 Calling Gemini API for Contract analysis...");

    // Jika terlalu panjang, pangkas agar tidak melebihi batas prompt
    const MAX_CHARS = 12000;
    let inputText = cvText;
    if (cvText.length > MAX_CHARS) {
      inputText = cvText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
      console.warn(
        "⚠️ Contract text truncated for Gemini prompt. Original length:",
        cvText.length
      );
    }

    // Prompt untuk analisa kontrak kerja
    const prompt = `Analyze this employment contract, find every highlight text and return ONLY valid JSON :
{
  "summary": "brief summary of the contract",
  "contractInfo": {
    "position": "job position/title",
    "company": "company name",
    "contractType": "permanent/contract/probation",
    "startDate": "start date if mentioned",
    "duration": "contract duration (e.g., 1 year, 2 years, indefinite)"
  },
  "salary": {
    "amount": "salary amount (number or range)",
    "currency": "currency (e.g., IDR, USD)",
    "frequency": "per month/year/hour",
    "additionalBenefits": ["benefit1", "benefit2"]
  },
  "workingConditions": {
    "workingHours": "working hours per day/week",
    "location": "work location",
    "remotePolicy": "remote/hybrid/onsite"
  },
  "keyTerms": [
    {"term": "important clause title", "description": "brief description"}
  ],
  "warnings": [
    {
      "severity": "high/medium/low",
      "clause": "problematic clause text (max 200 chars)",
      "issue": "what's the problem",
      "recommendation": "what to do about it"
    }
  ],
  "redFlags": ["red flag 1", "red flag 2"],
  "recommendations": "overall advice for the candidate"
}

CONTRACT TEXT:
${inputText}`;

    // Gunakan gemini-2.0-flash (free tier, terbaru)
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text;
    console.log("✅ Gemini response received (contract analysis)");

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    console.log("📄 Full Gemini response:");
    console.log("=".repeat(80));
    console.log(text);
    console.log("=".repeat(80));
    console.log("📊 Response length:", text.length, "characters");

    // Bersihkan markdown code blocks jika ada
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```(?:json)?\n/, "")
        .replace(/\n```$/, "");
    }

    console.log("🧹 Cleaned text length:", cleanText.length, "characters");

    // Parse JSON dari response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(cleanText);
  } catch (error: unknown) {
    console.error("❌ Error analyzing contract with Gemini:", error);

    // Return mock data if Gemini fails
    console.log("⚠️ Returning mock contract analysis data...");
    return {
      summary:
        "Contract analysis unavailable. Gemini API error. Please review the contract manually.",
      contractInfo: {
        position: "See contract for details",
        company: "See contract for details",
        contractType: "Unknown",
        startDate: "See contract",
        duration: "See contract",
      },
      salary: {
        amount: "See contract",
        currency: "IDR",
        frequency: "per month",
        additionalBenefits: ["See contract for benefits"],
      },
      workingConditions: {
        workingHours: "See contract",
        location: "See contract",
        remotePolicy: "See contract",
      },
      keyTerms: [
        {
          term: "Review Required",
          description: "Gemini API unavailable - manual review needed",
        },
      ],
      warnings: [
        {
          severity: "high",
          clause: "Unable to analyze",
          issue: "Gemini API error",
          recommendation: "Review contract with legal expert",
        },
      ],
      redFlags: ["API Error - Manual review required"],
      recommendations:
        "Gemini API unavailable. Please review the contract with a legal professional.",
    };
  }
}

export async function summarizePDF(pdfText: string) {
  try {
    if (!apiKey) {
      throw new Error(
        "Gemini API Key is not configured in environment variables"
      );
    }

    console.log("🤖 Calling Gemini API for summarization...");

    // Jika teks terlalu panjang, pangkas sebelum dikirim
    const MAX_SUMMARY_CHARS = 12000;
    let input = pdfText;
    if (pdfText.length > MAX_SUMMARY_CHARS) {
      input = pdfText.slice(0, MAX_SUMMARY_CHARS) + "\n\n[TRUNCATED]";
      console.warn(
        "⚠️ PDF text truncated for Gemini summarization. Original length:",
        pdfText.length
      );
    }

    const prompt = `Summarize the following document into a concise JSON object with fields: {"topic": "string", "keyPoints": ["string"], "conclusion": "string"}. Return JSON only.

DOCUMENT:\n${input}

Max 300 words in human-readable text inside the JSON fields.`;

    // Gunakan gemini-2.0-flash-exp (free tier, terbaru)
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text;
    console.log("✅ Gemini summary received (short prompt)");

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    return text;
  } catch (error: unknown) {
    console.error("❌ Error summarizing with Gemini:", error);

    // Return simple summary if Gemini fails
    console.log("⚠️ Returning basic summary (Gemini unavailable)...");

    const lines = pdfText.split("\n").filter((l) => l.trim());
    const preview = lines.slice(0, 15).join("\n");

    return `⚠️ Gemini API Quota Exceeded - Basic Summary:

📄 Document Preview (First 15 lines):
${preview}

...(${lines.length} total lines)

💡 For AI-powered summary, please:
1. Wait for quota reset
2. Or generate new API key at https://aistudio.google.com/apikey`;
  }
}
