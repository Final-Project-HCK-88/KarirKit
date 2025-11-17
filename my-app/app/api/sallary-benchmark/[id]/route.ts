import { NextRequest, NextResponse } from "next/server";
import SalaryRequestModel from "@/db/models/SalaryRequestModel";
import KBVectorModel from "@/db/models/KBVectorModel";
import errorHandler from "@/helpers/errHandler";
import { verifyToken } from "@/helpers/jwt";
import {
  generateGeminiEmbedding,
  generateGeminiContent,
} from "@/helpers/geminiai";
import { JWTPayload } from "@/types/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json({ message: "id required" }, { status: 400 });

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication token required." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token) as JWTPayload;
    const userId = decoded.userId;

    const requestDoc = await SalaryRequestModel.getById(id);
    if (!requestDoc)
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );

    // Build a short query text from the request
    const queryText = `JobTitle: ${requestDoc.jobTitle}; Location: ${requestDoc.location}; Experience: ${requestDoc.experienceYear} years; CurrentOrOfferedSalary: ${requestDoc.currentOrOfferedSallary}`;

    // embedding for query with metadata enrichment
    const queryEmbedding = await generateGeminiEmbedding(queryText, {
      metadata: {
        title: requestDoc.jobTitle,
        category: "salary_benchmark",
        tags: [
          requestDoc.location,
          `${requestDoc.experienceYear} years experience`,
        ],
      },
    });

    // search KB vector store using hybrid search (vector + keyword) for better accuracy
    const topK = 15;
    const keywords = [
      requestDoc.jobTitle,
      requestDoc.location,
      "salary",
      "gaji",
      `${requestDoc.experienceYear} tahun`,
    ];

    const nearest = await KBVectorModel.hybridSearch(
      queryEmbedding,
      keywords,
      topK,
      {
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        minScore: 0.6, // Filter hasil dengan score rendah
      }
    );

    const contexts = nearest
      .map(
        (r: any) =>
          `Source: ${r.source || r.sourceFile || "unknown"} (page/chunk ${
            r.loc?.lines?.from || r.metadata?.chunkIndex || "?"
          })\n${r.text || r.chunkText || ""}`
      )
      .join("\n\n---\n\n");

    // build prompt for generation with clear instructions
    const prompt = `You are an expert salary benchmarking assistant for the Indonesian job market.

**User Request:**
- Job Title: ${requestDoc.jobTitle}
- Location: ${requestDoc.location}
- Years of Experience: ${requestDoc.experienceYear}
- Current/Offered Salary: Rp ${requestDoc.currentOrOfferedSallary.toLocaleString(
      "id-ID"
    )}

**Retrieved Salary Data from Knowledge Base:**
${contexts || "No specific data retrieved from knowledge base."}

**Instructions:**
1. **PRIORITIZE** the retrieved knowledge base data above as your PRIMARY reference for salary benchmarking
2. Analyze the retrieved data to determine the market minimum, median, and maximum salary for this role/location/experience
3. If retrieved data is insufficient, supplement with your general knowledge of Indonesian job market salary standards
4. Provide 3-5 practical, actionable negotiation tips
5. Cite specific sources from the knowledge base if you used them

**CRITICAL: You MUST respond with ONLY valid JSON, no markdown code blocks, no extra text.**

Response format (valid JSON only):
{
  "marketMinimum": 10000000,
  "marketMedian": 15000000,
  "marketMaximum": 25000000,
  "userSalary": ${requestDoc.currentOrOfferedSallary},
  "negotiationTips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "analysis": "Brief analysis of user's salary position relative to market",
  "sources": ["source reference 1", "source reference 2"]
}

Return ONLY the JSON object, nothing else. Numbers should be integers (IDR per month), no formatting.
`;

    const gen = await generateGeminiContent(prompt);

    let cleaned = gen;
    if (typeof cleaned === "string") {
      cleaned = cleaned.trim();
      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    // Parse the JSON to validate and return as proper JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleaned || "{}");
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("AI returned invalid JSON format");
    }

    return NextResponse.json(
      {
        message: "Benchmark generated successfully",
        data: parsedResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /sallary-benchmark/[id]:", error);
    return errorHandler(error);
  }
}
