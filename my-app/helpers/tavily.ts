import { tavily } from "@tavily/core";

/**
 * Get Tavily client instance (lazy initialization)
 */
function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set in environment variables");
  }
  return tavily({ apiKey });
}

/**
 * Search for salary benchmarking data using Tavily AI
 * @param jobTitle - The job title to search for
 * @param location - The location (city/country)
 * @param experienceYear - Years of experience
 * @returns Search results from Tavily
 */
export async function searchSalaryBenchmark(
  jobTitle: string,
  location: string,
  experienceYear: number
) {
  try {
    console.log("🌐 Initiating Tavily AI search for salary benchmark...");
    const tvly = getTavilyClient();

    // Construct a comprehensive search query for salary benchmarking
    const query = `Standar gaji ${jobTitle} di ${location} , dengan ${experienceYear} tahun pengalaman`;
    console.log(`🔍 Tavily search query: "${query}"`);

    // Search with Tavily API
    const response = await tvly.search(query, {
      searchDepth: "advanced", // Use advanced search for more comprehensive results
      maxResults: 10, // Get top 10 results
      includeAnswer: true, // Get AI-generated answer
      includeRawContent: false, // Don't need raw HTML
      includeDomains: [
        "glints.com",
        "jobstreet.co.id",
        "glassdoor.com",
        "indeed.com",
        "kalibrr.com",
        "linkedin.com",
        "payscale.com",
        "salary.com",
      ], // Focus on reliable job/salary sites
      excludeDomains: [], // No exclusions for now
    });

    console.log(
      `✅ Tavily AI returned ${response.results?.length || 0} results`
    );
    if (response.answer) {
      console.log("💡 Tavily AI generated summary available");
    }

    return response;
  } catch (error) {
    console.error("❌ Error searching with Tavily:", error);
    throw error;
  }
}

/**
 * Search for general salary information with custom query
 * @param query - Custom search query
 * @param options - Additional search options
 * @returns Search results from Tavily
 */
export async function searchSalaryData(
  query: string,
  options?: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeDomains?: string[];
  }
) {
  try {
    const tvly = getTavilyClient();

    const response = await tvly.search(query, {
      searchDepth: options?.searchDepth || "advanced",
      maxResults: options?.maxResults || 10,
      includeAnswer: true,
      includeRawContent: false,
      includeDomains: options?.includeDomains || [
        "glints.com",
        "jobstreet.co.id",
        "glassdoor.com",
        "indeed.com",
        "kalibrr.com",
        "linkedin.com",
        "payscale.com",
        "salary.com",
      ],
    });

    return response;
  } catch (error) {
    console.error("Error searching salary data with Tavily:", error);
    throw error;
  }
}
