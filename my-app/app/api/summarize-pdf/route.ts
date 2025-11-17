import { NextRequest, NextResponse } from "next/server";
import ResumeModel from "@/db/models/ResumeModel";

export async function POST(request: NextRequest) {
  try {
    console.log("\n📝 === SUMMARIZE PDF API STARTED ===");
    const body = await request.json();
    const { resumeId } = body;
    console.log("📋 Resume ID received:", resumeId);

    if (!resumeId) {
      return NextResponse.json(
        { message: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Ambil resume dari MongoDB
    console.log("📚 Fetching resume from MongoDB...");
    const resume = await ResumeModel.findById(resumeId);

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    const pdfText = resume.extractedText;

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { message: "No text found in PDF" },
        { status: 400 }
      );
    }

    console.log("PDF text retrieved from DB, length:", pdfText.length);

    // Simple summarization tanpa AI - ambil paragraf pertama dan buat bullet points
    const lines = pdfText
      .split("\n")
      .filter((line: string) => line.trim().length > 0);
    const words = pdfText.split(/\s+/);
    const wordCount = words.length;

    // Ambil 10 baris pertama sebagai preview
    const preview = lines.slice(0, 10).join("\n");

    // Buat simple summary
    const summary = `
📄 **Document Overview**

📊 **Statistics:**
- Total Words: ${wordCount}
- Total Lines: ${lines.length}
- Total Characters: ${pdfText.length}

📝 **Content Preview (First 10 lines):**
${preview}

${lines.length > 10 ? "\n... (and more)" : ""}
`;

    return NextResponse.json(
      {
        message: "PDF text retrieved successfully",
        data: {
          summary: summary,
          fullText: pdfText,
          wordCount: wordCount,
          lineCount: lines.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ === SUMMARIZE PDF API ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        message: "Failed to summarize PDF",
        error: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name || "Unknown",
      },
      { status: 500 }
    );
  }
}
