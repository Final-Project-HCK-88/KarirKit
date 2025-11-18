import { NextRequest, NextResponse } from "next/server";
import ResumeModel from "@/db/models/ResumeModel";
import AnalysisModel from "@/db/models/AnalysisModel";
import { analyzeCVWithGemini } from "@/helpers/gemini";
import { getServerUser } from "@/helpers/auth";
import { JWTPayload } from "@/types/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("\n🔍 === GET ANALYSIS API STARTED ===");

    // Get user from middleware-injected headers or fallback to getServerUser
    let userId = request.headers.get("X-User-Id");

    if (!userId) {
      // Fallback to getServerUser for backwards compatibility
      const user = (await getServerUser()) as JWTPayload | null;
      if (!user || !user.userId) {
        return NextResponse.json(
          { message: "Unauthorized. Please login first." },
          { status: 401 }
        );
      }
      userId = user.userId;
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json(
        { message: "Resume ID is required" },
        { status: 400 }
      );
    }

    console.log("📋 Fetching analysis for resumeId:", resumeId);
    console.log("👤 User ID:", userId);

    // Check if analysis exists
    const existingAnalysis = await AnalysisModel.findByResumeIdAndUserId(
      resumeId,
      userId
    );

    if (!existingAnalysis || existingAnalysis.length === 0) {
      return NextResponse.json(
        {
          message: "No analysis found for this resume",
          hasAnalysis: false,
        },
        { status: 404 }
      );
    }

    const analysis = existingAnalysis[0];

    return NextResponse.json(
      {
        message: "Analysis found",
        hasAnalysis: true,
        data: {
          analysisId: analysis._id.toString(),
          analysis: analysis.result,
          analyzedAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching analysis:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch analysis",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("\n🔍 === ANALYZE CV API STARTED ===");

    // Get logged in user
    const user = (await getServerUser()) as JWTPayload | null;
    if (!user || !user.userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    console.log("👤 User ID:", user.userId);

    const body = await request.json();
    const { resumeId } = body;
    console.log("📋 Resume ID received:", resumeId);

    if (!resumeId) {
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

    // Validasi: Resume harus milik user yang sedang login
    if (resume.userId !== user.userId) {
      return NextResponse.json(
        { message: "Forbidden. This resume does not belong to you." },
        { status: 403 }
      );
    }

    const pdfText = resume.extractedText;

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { message: "No text found in resume. Please upload PDF first." },
        { status: 400 }
      );
    }

    console.log("📝 Extracted text length:", pdfText.length);

    // Check if analysis already exists for this resume
    console.log("🔍 Checking for existing analysis...");
    const existingAnalysis = await AnalysisModel.findByResumeIdAndUserId(
      resumeId,
      user.userId
    );

    if (existingAnalysis && existingAnalysis.length > 0) {
      console.log("✅ Found existing analysis, returning cached result");
      return NextResponse.json(
        {
          message: "Analysis retrieved from cache",
          data: {
            analysisId: existingAnalysis[0]._id.toString(),
            rawText: pdfText.substring(0, 500) + "...",
            textLength: pdfText.length,
            analysis: existingAnalysis[0].result,
            source: "cached",
            analyzedAt: existingAnalysis[0].createdAt,
          },
        },
        { status: 200 }
      );
    }

    // Step 2: Analyze dengan Gemini AI
    console.log("🤖 Analyzing with Gemini AI...");

    try {
      const analysis = await analyzeCVWithGemini(pdfText);

      console.log("✅ Gemini analysis successful");

      // Save analysis to database
      console.log("💾 Saving analysis to database...");
      const savedAnalysis = await AnalysisModel.create({
        userId: user.userId,
        resumeId: resumeId,
        analysisType: "contract",
        result: analysis,
      });

      console.log("✅ Analysis saved with ID:", savedAnalysis._id);

      return NextResponse.json(
        {
          message: "CV analyzed successfully with Gemini AI",
          data: {
            analysisId: savedAnalysis._id.toString(),
            rawText: pdfText.substring(0, 500) + "...", // Preview saja
            textLength: pdfText.length,
            analysis: analysis,
            source: "gemini-ai",
            analyzedAt: savedAnalysis.createdAt,
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

export async function DELETE(request: NextRequest) {
  try {
    console.log("\n🗑️ === DELETE RESUME & ANALYSIS API STARTED ===");

    // Get logged in user
    const user = (await getServerUser()) as JWTPayload | null;
    if (!user || !user.userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json(
        { message: "Resume ID is required" },
        { status: 400 }
      );
    }

    console.log("📋 Deleting resume ID:", resumeId);

    // Check if resume exists and belongs to user
    const resume = await ResumeModel.findById(resumeId);

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    if (resume.userId !== user.userId) {
      return NextResponse.json(
        { message: "Forbidden. This resume does not belong to you." },
        { status: 403 }
      );
    }

    // Delete associated analyses first (cascade delete)
    console.log("🗑️ Deleting associated analyses...");
    const deletedAnalyses = await AnalysisModel.deleteByResumeId(resumeId);
    console.log(`✅ Deleted ${deletedAnalyses} analysis records`);

    // Delete the resume
    console.log("🗑️ Deleting resume...");
    const deletedResume = await ResumeModel.deleteById(resumeId);

    if (!deletedResume) {
      return NextResponse.json(
        { message: "Failed to delete resume" },
        { status: 500 }
      );
    }

    console.log("✅ Resume and analyses deleted successfully");

    return NextResponse.json(
      {
        message: "Resume and associated analyses deleted successfully",
        data: {
          resumeId,
          deletedAnalyses,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting resume:", error);
    return NextResponse.json(
      {
        message: "Failed to delete resume",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
