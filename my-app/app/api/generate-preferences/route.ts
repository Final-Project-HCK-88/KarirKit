import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import CVModel from "@/db/models/CVModel";
import { generateGeminiContent } from "@/helpers/geminiai";

// POST /api/generate-preferences - Generate user preferences from CV
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const userEmail = request.headers.get("X-User-Email");

    console.log("🔒 Protected endpoint: /api/generate-preferences");
    console.log("📧 User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    // Fetch user's CV
    const cv = await CVModel.findByUserId(new ObjectId(userId));

    if (!cv) {
      return NextResponse.json(
        { error: "CV not found. Please upload your CV first." },
        { status: 404 }
      );
    }

    console.log("📄 Generating preferences from CV...");
    console.log("📝 CV text length:", cv.text.length);

    // Try Gemini AI with retry
    let preferences;
    let geminiSuccess = false;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🤖 Attempt ${attempt}: Calling Gemini AI...`);

        const prompt = `
Analyze the following CV/Resume and extract the following information in JSON format:

{
  "position": "Job title/position the person is looking for or has experience in",
  "skills": "Comma-separated list of key technical skills",
  "experienceLevel": "junior/mid/senior based on years of experience",
  "yearsOfExperience": "Number of years of work experience",
  "location": "Preferred work location or current location",
  "industry": "Industry domain (e.g., Technology, Finance, Healthcare)",
  "expectedSalary": "Expected salary range if mentioned, or estimate based on experience and position"
}

CV/Resume Text:
${cv.text}

Important:
- Return ONLY valid JSON, no markdown formatting
- If information is not found, use reasonable estimates based on the CV content
- For expectedSalary, provide a number in millions (e.g., 15 for 15 million IDR)
- For skills, extract top 5-7 most relevant skills
- Be concise and accurate
`;

        const geminiResponse = await generateGeminiContent(prompt, 30000); // 30s timeout

        // Parse JSON from Gemini response
        const cleanResponse = geminiResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        preferences = JSON.parse(cleanResponse);
        geminiSuccess = true;
        console.log("✅ Preferences generated with Gemini:", preferences);
        break;
      } catch (error) {
        console.error(`❌ Gemini attempt ${attempt} failed:`, error);
        if (attempt < 2) {
          console.log("⏳ Waiting 2s before retry...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    // Fallback: Simple text extraction if Gemini fails
    if (!geminiSuccess) {
      console.log("⚠️ Gemini failed, using fallback extraction...");

      const text = cv.text.toLowerCase();

      // Extract position (look for common patterns)
      let position = "Software Engineer";
      const positionPatterns = [
        /position[:\s]+([^\n,]+)/i,
        /title[:\s]+([^\n,]+)/i,
        /role[:\s]+([^\n,]+)/i,
        /(software engineer|developer|analyst|manager|designer|consultant)/i,
      ];

      for (const pattern of positionPatterns) {
        const match = cv.text.match(pattern);
        if (match) {
          position = match[1]?.trim() || match[0]?.trim() || position;
          break;
        }
      }

      // Extract location
      let location = "Jakarta";
      const locationPatterns = [
        /location[:\s]+([^\n,]+)/i,
        /address[:\s]+([^\n,]+)/i,
        /(jakarta|bandung|surabaya|yogyakarta|bali)/i,
      ];

      for (const pattern of locationPatterns) {
        const match = cv.text.match(pattern);
        if (match) {
          location = match[1]?.trim() || match[0]?.trim() || location;
          break;
        }
      }

      // Estimate experience
      const experienceMatch = cv.text.match(/(\d+)\s*(?:years?|tahun)/i);
      const yearsOfExperience = experienceMatch
        ? parseInt(experienceMatch[1])
        : 3;

      const experienceLevel =
        yearsOfExperience < 2
          ? "junior"
          : yearsOfExperience < 5
          ? "mid"
          : "senior";

      // Extract skills (common tech keywords)
      const techKeywords = [
        "javascript",
        "typescript",
        "python",
        "java",
        "react",
        "node",
        "sql",
        "mongodb",
        "aws",
        "docker",
        "kubernetes",
      ];
      const foundSkills = techKeywords.filter((skill) => text.includes(skill));
      const skills =
        foundSkills.length > 0
          ? foundSkills.join(", ")
          : "Programming, Problem Solving";

      // Estimate salary based on experience
      const salaryEstimate =
        yearsOfExperience < 2 ? 8 : yearsOfExperience < 5 ? 15 : 25;

      preferences = {
        position,
        skills,
        experienceLevel,
        yearsOfExperience,
        location,
        industry: "Technology",
        expectedSalary: salaryEstimate,
      };

      console.log("✅ Fallback preferences generated:", preferences);
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("❌ Error generating preferences:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate preferences";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
