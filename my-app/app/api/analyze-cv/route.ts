import { NextRequest, NextResponse } from "next/server";
import ResumeModel from "@/db/models/ResumeModel";
import { analyzeCVWithGemini } from "@/helpers/gemini";

export async function POST(request: NextRequest) {
  try {
    console.log("\n🔍 === ANALYZE CV API STARTED ===");
    const body = await request.json();
    console.log("📦 Full request body:", JSON.stringify(body));
    const { resumeId } = body;
    console.log("📋 Resume ID received:", resumeId);
    console.log("📋 Resume ID type:", typeof resumeId);

    if (!resumeId) {
      console.error("❌ Resume ID is missing or undefined!");
      return NextResponse.json(
        { message: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Step 1: Ambil resume dari MongoDB
    console.log("📚 Fetching resume from MongoDB...");
    const resume = await ResumeModel.findById(resumeId);

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    const pdfText = resume.extractedText;

    console.log("📝 Extracted text raw length:", pdfText?.length || 0);
    console.log(
      "📝 Extracted text trimmed length:",
      pdfText?.trim().length || 0
    );
    console.log("📝 Text preview:", pdfText?.substring(0, 100));

    if (!pdfText || pdfText.trim().length === 0) {
      console.error(
        "❌ No valid text extracted from PDF. N8N extraction may have failed."
      );
      return NextResponse.json(
        {
          message:
            "No text could be extracted from the PDF. The document might be scanned image or n8n extraction failed. Please try a different PDF or check if the file contains selectable text.",
          error: "EMPTY_TEXT",
          debug: {
            rawLength: pdfText?.length || 0,
            trimmedLength: pdfText?.trim().length || 0,
          },
        },
        { status: 400 }
      );
    }

    console.log("📝 Extracted text length:", pdfText.length);

    // Step 2: Analyze dengan Gemini AI
    console.log("🤖 Analyzing with Gemini AI...");

    try {
      const analysis = await analyzeCVWithGemini(pdfText);

      console.log("✅ Gemini analysis successful");

      return NextResponse.json(
        {
          message: "CV analyzed successfully with Gemini AI",
          data: {
            rawText: pdfText.substring(0, 500) + "...", // Preview saja
            textLength: pdfText.length,
            analysis: analysis,
            source: "gemini-ai",
          },
        },
        { status: 200 }
      );
    } catch (geminiError) {
      console.error("❌ Gemini error:", geminiError);

      // Fallback to mock data if Gemini fails
      const mockAnalysis = {
        summary: `CV Analysis (Gemini unavailable)\n\nExtracted ${pdfText.length} characters from CV.\n\nPlease review the raw text for details.`,
        personalInfo: {
          name: "See extracted text",
          email: "See extracted text",
          phone: "See extracted text",
          location: "See extracted text",
        },
        skills: ["Review extracted text for skills"],
        experience: [
          {
            company: "See extracted text",
            position: "N/A",
            duration: "N/A",
            description: "Gemini AI analysis failed",
          },
        ],
        education: [
          {
            institution: "See extracted text",
            degree: "N/A",
            field: "N/A",
            year: "N/A",
          },
        ],
        strengths: [
          "Text extracted successfully - " + pdfText.length + " chars",
        ],
        recommendations: [
          "Gemini AI unavailable",
          "Review extracted text manually",
        ],
      };

      return NextResponse.json(
        {
          message: "CV text extracted but Gemini analysis failed",
          data: {
            rawText: pdfText.substring(0, 500) + "...",
            textLength: pdfText.length,
            analysis: mockAnalysis,
            source: "mock-fallback",
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ === ANALYZE CV API ERROR ===");
    console.error("Error:", error);

    return NextResponse.json(
      {
        message: "Failed to analyze CV",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
