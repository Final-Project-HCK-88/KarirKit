import { NextRequest, NextResponse } from "next/server";
import SalaryRequestModel from "@/db/models/SalaryRequestModel";
import KBVectorModel from "@/db/models/KBVectorModel";
import CacheModel from "@/db/models/CacheModel";
import errorHandler from "@/helpers/errHandler";
import {
  generateGeminiEmbedding,
  generateGeminiContent,
} from "@/helpers/geminiai";
import { searchSalaryBenchmark } from "@/helpers/tavily";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json({ message: "id required" }, { status: 400 });

    // Get userId from middleware-injected header
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. User ID not found." },
        { status: 401 }
      );
    }

    const requestDoc = await SalaryRequestModel.getById(id);
    if (!requestDoc)
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );

    // Prepare cache key from preferences
    const cachePreferences = {
      jobTitle: requestDoc.jobTitle,
      location: requestDoc.location,
      experienceYear: requestDoc.experienceYear,
      currentOrOfferedSallary: requestDoc.currentOrOfferedSallary,
    };

    // Check cache first
    const cachedResult = await CacheModel.getCached(
      "salary_benchmark",
      cachePreferences
    );

    if (cachedResult) {
      console.log("✅ Returning cached salary benchmark result");
      return NextResponse.json(
        {
          message: "Benchmark retrieved from cache",
          data: cachedResult,
          cached: true,
        },
        { status: 200 }
      );
    }

    console.log("🔄 Cache miss, generating new salary benchmark...");

    // Build query text for embedding search
    const queryText = `JobTitle: ${requestDoc.jobTitle}; Location: ${requestDoc.location}; Experience: ${requestDoc.experienceYear} years; CurrentOrOfferedSalary: ${requestDoc.currentOrOfferedSallary}`;

    // HYBRID APPROACH: Run both searches in parallel for better performance
    const [tavilyResults, queryEmbedding] = await Promise.all([
      // 1. Search real-time web data using Tavily AI
      searchSalaryBenchmark(
        requestDoc.jobTitle,
        requestDoc.location,
        requestDoc.experienceYear
      ),
      // 2. Generate embedding for knowledge base search
      generateGeminiEmbedding(queryText, {
        metadata: {
          title: requestDoc.jobTitle,
          category: "salary_benchmark",
          tags: [
            requestDoc.location,
            `${requestDoc.experienceYear} years experience`,
          ],
        },
      }),
    ]);

    // Search knowledge base using embedding with hybrid search
    const topK = 10;
    const keywords = [
      requestDoc.jobTitle,
      requestDoc.location,
      "salary",
      "gaji",
      `${requestDoc.experienceYear} tahun`,
    ];

    const kbResults = await KBVectorModel.hybridSearch(
      queryEmbedding,
      keywords,
      topK,
      {
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        minScore: 0.6,
      }
    );

    // Format Tavily web search results
    const tavilyContexts = tavilyResults.results
      .map(
        (result: any, index: number) =>
          `[WEB SOURCE ${index + 1}] ${result.url}
Title: ${result.title}
Content: ${result.content}
${result.score ? `Relevance: ${result.score.toFixed(2)}` : ""}`
      )
      .join("\n\n---\n\n");

    // Format Knowledge Base results
    const kbContexts = kbResults
      .map(
        (r: any, index: number) =>
          `[KB SOURCE ${index + 1}] ${
            r.source || r.sourceFile || "Internal Knowledge Base"
          } (page/chunk ${r.loc?.lines?.from || r.metadata?.chunkIndex || "?"})
Score: ${r.score?.toFixed(2) || "N/A"}
Content: ${r.text || r.chunkText || ""}`
      )
      .join("\n\n---\n\n");

    // Combine both contexts with clear separation
    const combinedContexts = `
=== REAL-TIME WEB DATA (Tavily AI) ===
${tavilyContexts || "No web data retrieved."}

${
  tavilyResults.answer
    ? `\n**Tavily AI Web Summary:**\n${tavilyResults.answer}\n`
    : ""
}

=== KNOWLEDGE BASE DATA (Embedding Search) ===
${kbContexts || "No knowledge base data retrieved."}
`;

    // build prompt for generation with clear instructions using HYBRID data
    const prompt = `You are an expert salary benchmarking assistant for the Indonesian job market.

**User Request:**
- Job Title: ${requestDoc.jobTitle}
- Location: ${requestDoc.location}
- Years of Experience: ${requestDoc.experienceYear}
- Current/Offered Salary: Rp ${requestDoc.currentOrOfferedSallary.toLocaleString(
      "id-ID"
    )}

**HYBRID DATA SOURCES:**
${combinedContexts}

**Instructions:**
1. **USE BOTH DATA SOURCES** to create the most accurate salary benchmark:
   - Real-time web data (Tavily) for current market trends and actual job postings
   - Knowledge base data (Embedding) for historical context and comprehensive salary surveys
2. **Cross-validate** information from both sources to ensure accuracy
3. Determine the market minimum, median, and maximum salary (in IDR per month) for this role/location/experience level
4. If the two sources show different ranges, explain the variance and provide a weighted recommendation
5. Compare the user's current/offered salary against the combined market data
6. Provide 3-5 practical, actionable negotiation tips based on insights from BOTH data sources
7. Cite specific sources from web search (URLs) and knowledge base references that were most relevant
8. Indicate which data source(s) were most helpful for each insight

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

    // Save to cache (24 hours TTL)
    await CacheModel.setCache(
      "salary_benchmark",
      cachePreferences,
      parsedResult,
      24
    );

    return NextResponse.json(
      {
        message: "Benchmark generated successfully",
        data: parsedResult,
        cached: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /sallary-benchmark/[id]:", error);
    return errorHandler(error);
  }
}
