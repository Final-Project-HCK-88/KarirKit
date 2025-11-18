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
Analyze the following CV/Resume and generate 3-4 different career preference options based on the candidate's skills, experience, and potential career paths.

Return a JSON array with 3-4 career options:

{
  "options": [
    {
      "id": "1",
      "title": "Brief, catchy title for this career path (e.g., 'Senior Developer Role', 'Tech Lead Position')",
      "description": "2-3 sentence description explaining why this is a good fit based on their CV",
      "position": "Specific job title",
      "skills": "Comma-separated list of relevant technical skills",
      "experienceLevel": "junior/mid/senior",
      "yearsOfExperience": "Number of years",
      "location": "Preferred work location",
      "industry": "Industry domain",
      "expectedSalary": "Salary in millions IDR (number only)"
    }
  ]
}

CV/Resume Text:
${cv.text}

Important:
- Generate 3-4 DIFFERENT career options (e.g.,specialized role, different industry)
- Each option should be realistic based on their actual experience and skills
- Return ONLY valid JSON object with "options" array, no markdown formatting
- For expectedSalary, analyze the CV and provide realistic salary estimation in millions IDR based on their experience level, skills, and position (e.g., junior: 6-10, mid: 12-20, senior: 20-35)
- Make titles realistic based on their cv and specific (max 50 chars)
- Descriptions should highlight why this path matches their CV (max 150 chars)
- Skills should be comma-separated string
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

      // Generate 3 fallback options with variations
      preferences = {
        options: [
          {
            id: "1",
            title: `${position} - Current Level`,
            description: `Continue growing in your current role with ${yearsOfExperience} years of experience in ${
              skills.split(",")[0]?.trim() || "your field"
            }.`,
            position,
            skills,
            experienceLevel,
            yearsOfExperience,
            location,
            industry: "Technology",
            expectedSalary: salaryEstimate,
          },
          {
            id: "2",
            title: `Senior ${position}`,
            description: `Step up to a senior position leveraging your expertise in ${
              skills.split(",").slice(0, 2).join(" and ") || "technology"
            }.`,
            position: `Senior ${position}`,
            skills,
            experienceLevel: experienceLevel === "junior" ? "mid" : "senior",
            yearsOfExperience: yearsOfExperience + 2,
            location,
            industry: "Technology",
            expectedSalary: salaryEstimate + 7,
          },
          {
            id: "3",
            title: `${position} - Tech Lead`,
            description: `Transition into technical leadership, combining hands-on work with team guidance and mentoring.`,
            position: `${position} (Tech Lead)`,
            skills: `${skills}, Leadership, Team Management`,
            experienceLevel: "senior",
            yearsOfExperience: yearsOfExperience + 1,
            location,
            industry: "Technology",
            expectedSalary: salaryEstimate + 10,
          },
        ],
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
