import { GoogleGenAI } from "@google/genai";
import { fetchJobsByPreferences, LinkedInJob } from "./linkedinJobs";
import { generateOpenAIContent } from "./openai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const USE_OPENAI = process.env.USE_OPENAI === "true";
const USE_OPENAI_EMBEDDINGS = process.env.USE_OPENAI_EMBEDDINGS === "true";

export async function generateGeminiContent(prompt: string, timeoutMs = 60000) {
  // Use OpenAI if enabled
  if (USE_OPENAI) {
    console.log("🔄 Using OpenAI instead of Gemini");
    return await generateOpenAIContent(prompt, "gpt-4o-mini", 2000);
  }

  // Otherwise use Gemini
  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Gemini API timeout after " + timeoutMs + "ms")),
      timeoutMs
    );
  });

  // Create API call promise
  const apiPromise = ai.models
    .generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    .then((response) => {
      // Log token usage
      if (response.usageMetadata) {
        console.log("📊 Token Usage:");
        console.log(
          "  - Prompt tokens:",
          response.usageMetadata.promptTokenCount
        );
        console.log(
          "  - Response tokens:",
          response.usageMetadata.candidatesTokenCount
        );
        console.log(
          "  - Total tokens:",
          response.usageMetadata.totalTokenCount
        );
      }
      return response.text;
    });

  // Race between timeout and API call
  try {
    const result = await Promise.race([apiPromise, timeoutPromise]);
    return result as string;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

/**
 * Preprocess text untuk meningkatkan kualitas embedding
 */
function preprocessTextForEmbedding(text: string): string {
  // 1. Lowercase untuk konsistensi
  let processed = text.toLowerCase();

  // 2. Remove extra whitespace
  processed = processed.replace(/\s+/g, " ").trim();

  // 3. Remove special characters yang tidak penting (opsional, tergantung use case)
  // processed = processed.replace(/[^\w\s.,!?-]/g, '');

  // 4. Limit panjang text (embedding models punya token limit)
  // Gemini embedding models biasanya support ~2048 tokens
  const maxLength = 8000; // ~2000 tokens
  if (processed.length > maxLength) {
    processed = processed.substring(0, maxLength);
    console.warn(`Text truncated to ${maxLength} characters for embedding`);
  }

  return processed;
}

/**
 * Add context atau metadata ke text untuk embedding yang lebih kaya
 */
function enrichTextWithContext(
  text: string,
  metadata?: {
    title?: string;
    category?: string;
    tags?: string[];
  }
): string {
  if (!metadata) return text;

  let enrichedText = text;

  // Tambahkan title sebagai konteks penting
  if (metadata.title) {
    enrichedText = `Title: ${metadata.title}\n\n${enrichedText}`;
  }

  // Tambahkan category
  if (metadata.category) {
    enrichedText = `Category: ${metadata.category}\n${enrichedText}`;
  }

  // Tambahkan tags
  if (metadata.tags && metadata.tags.length > 0) {
    enrichedText = `${enrichedText}\n\nTags: ${metadata.tags.join(", ")}`;
  }

  return enrichedText;
}

// Create embeddings using Google AI (Gemini) or OpenAI API
// Can be configured to use OpenAI as primary via USE_OPENAI_EMBEDDINGS env var
export async function generateGeminiEmbedding(
  input: string | string[],
  options?: {
    preprocess?: boolean;
    metadata?: { title?: string; category?: string; tags?: string[] };
  }
) {
  // If USE_OPENAI_EMBEDDINGS is true, use OpenAI directly without trying Gemini first
  if (USE_OPENAI_EMBEDDINGS) {
    console.log("Using OpenAI embeddings (primary)...");
    const { generateOpenAIEmbedding } = await import("./openai");

    // Handle single text
    let text = Array.isArray(input) ? input.join(" ") : input;

    // Apply preprocessing if enabled
    if (options?.preprocess !== false) {
      text = preprocessTextForEmbedding(text);
    }

    // Apply context enrichment if metadata provided
    if (options?.metadata) {
      text = enrichTextWithContext(text, options.metadata);
    }

    return await generateOpenAIEmbedding(text);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // Try Gemini first if available (primary)
  if (geminiApiKey) {
    try {
      console.log("Using Gemini embeddings (primary)...");
      const model = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004"; // Updated default to newer model
      console.log(`Using Gemini model: ${model}`);
      let text = Array.isArray(input) ? input[0] : input;

      // Apply preprocessing if enabled
      if (options?.preprocess !== false) {
        // Default true
        text = preprocessTextForEmbedding(text);
      }

      // Apply context enrichment if metadata provided
      if (options?.metadata) {
        text = enrichTextWithContext(text, options.metadata);
      }

      const requestBody: {
        content: { parts: { text: string }[] };
        outputDimensionality?: number;
      } = {
        content: {
          parts: [{ text }],
        },
        // Set to 1536 to match MongoDB vector index
        outputDimensionality: 1536,
      };

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiApiKey}`;
      console.log(
        `Gemini API URL: ${apiUrl.replace(geminiApiKey, "API_KEY_HIDDEN")}`
      );
      console.log(`Request body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Gemini API HTTP ${response.status}: ${responseText}`);

        // If 404, might be wrong model name or endpoint
        if (response.status === 404) {
          console.error(
            `Model "${model}" not found. Check if model name is correct.`
          );
          console.error(
            `Available models: gemini-embedding-001, text-embedding-004`
          );
        }

        throw new Error(
          `Gemini API error (${response.status}): ${responseText.substring(
            0,
            200
          )}`
        );
      }

      // Get response text first to handle empty responses
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Gemini API returned empty response");
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error(
          "Failed to parse Gemini response:",
          responseText.substring(0, 500)
        );
        throw new Error(`Gemini API returned invalid JSON: ${parseErr}`);
      }
      const embedding = data?.embedding?.values;

      if (!embedding || !Array.isArray(embedding)) {
        console.error(
          "Invalid Gemini embedding response:",
          JSON.stringify(data)
        );
        throw new Error("Gemini embeddings response missing embedding values");
      }

      // Validate dimension size
      console.log(`Gemini embedding generated: ${embedding.length} dimensions`);

      if (embedding.length !== 1536) {
        console.warn(
          `Warning: Expected 1536 dimensions but got ${embedding.length}`
        );
        // If dimension is wrong, try OpenAI fallback
        throw new Error(
          `Gemini dimension mismatch: expected 1536 but got ${embedding.length}`
        );
      }

      return embedding;
    } catch (geminiErr: unknown) {
      // Handle specific error types
      if (geminiErr instanceof Error) {
        if (geminiErr.name === "AbortError") {
          console.error("Gemini API request timeout (30s exceeded)");
        } else {
          console.error("Gemini embedding error:", geminiErr.message);
        }
      } else {
        console.error("Gemini embedding error:", geminiErr);
      }
      console.log("Attempting OpenAI fallback...");
      // Fall through to try OpenAI
    }
  }

  // Fallback to OpenAI if Gemini is not available or failed
  if (!openAiKey) {
    throw new Error(
      "Neither GEMINI_API_KEY nor OPENAI_API_KEY found in environment variables"
    );
  }

  try {
    console.log("Using OpenAI embeddings (fallback)...");
    const openaiModel =
      process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002";
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        input: Array.isArray(input) ? input[0] : input,
        // text-embedding-ada-002 always returns 1536 dimensions
        // text-embedding-3-small can be configured with dimensions parameter
        ...(openaiModel === "text-embedding-3-small" && { dimensions: 1536 }),
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await resp.json();
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("OpenAI embeddings response missing embedding");
    }

    console.log(`OpenAI embedding generated: ${embedding.length} dimensions`);

    if (embedding.length !== 1536) {
      throw new Error(
        `OpenAI dimension mismatch: expected 1536 but got ${embedding.length}`
      );
    }

    return embedding;
  } catch (openErr: unknown) {
    console.error(
      "OpenAI embedding error:",
      openErr instanceof Error ? openErr.message : openErr
    );
    throw new Error(
      "Failed to generate embeddings from both Gemini and OpenAI. Please check your API keys and try again."
    );
  }
}

/**
 * Match jobs with AI using REAL-TIME data from LinkedIn API
 * Flow: User preferences → Fetch from LinkedIn → AI filtering → All matches with scores
 */
export async function matchJobsWithAIRealtime(preferences: {
  location: string;
  industry: string;
  expectedSalary: number;
  skill?: string[] | string;
  position: string;
}) {
  // Normalize skill to array
  let skillsArray: string[] = [];
  if (preferences.skill) {
    if (Array.isArray(preferences.skill)) {
      skillsArray = preferences.skill;
    } else if (typeof preferences.skill === "string") {
      skillsArray = [preferences.skill];
    }
  }

  // Fetch real-time jobs from LinkedIn based on user preferences
  console.log("Fetching real-time jobs from LinkedIn...");
  const linkedInJobs = await fetchJobsByPreferences({
    position: preferences.position,
    location: preferences.location,
    expectedSalary: preferences.expectedSalary,
    industry: preferences.industry,
  });

  if (!linkedInJobs || linkedInJobs.length === 0) {
    throw new Error(
      "No jobs found from LinkedIn. Try different search criteria."
    );
  }

  console.log(`Found ${linkedInJobs.length} jobs from LinkedIn`);

  // Format jobs data for AI (limit to 10 to avoid token overflow and reduce processing time)
  const jobsToAnalyze = linkedInJobs.slice(0, 10);
  console.log(`Analyzing ${jobsToAnalyze.length} jobs with AI...`);
  console.log(`⏱️  Estimated processing time: 20-40 seconds`);

  const jobsData = jobsToAnalyze.map((job: LinkedInJob, index: number) => ({
    id: job.jobId || `linkedin-${index}`,
    position: job.position,
    company: job.company,
    companyLogo: job.companyLogo,
    location: job.location,
    date: job.date,
    salary: job.salary,
    jobUrl: job.jobUrl,
  }));

  // Create AI prompt for intelligent filtering (simplified to reduce token usage)
  const prompt = `
Match ${jobsData.length} jobs with preferences:
Position: ${preferences.position} | Location: ${
    preferences.location
  } | Industry: ${preferences.industry} | Salary: ${
    preferences.expectedSalary
  } IDR${skillsArray.length > 0 ? ` | Skills: ${skillsArray.join(", ")}` : ""}

Jobs:
${JSON.stringify(jobsData)}

For each job, add:
- matchScore: 0-100 (position>location>salary>industry)
- matchReason: ONE sentence max (20 words)

Return ONLY valid JSON array. No markdown, no text, just [{...}, {...}].
`;

  console.log("Sending jobs to AI for intelligent matching...");
  console.log(`📝 Prompt length: ${prompt.length} characters`);

  try {
    // For OpenAI, we need to pass higher max_tokens via generateOpenAIContent directly
    let aiResponse: string;
    if (USE_OPENAI) {
      aiResponse = await generateOpenAIContent(prompt, "gpt-4o-mini", 4000); // Increase from 2000 to 4000 tokens
    } else {
      aiResponse = await generateGeminiContent(prompt, 90000); // 90 second timeout for Gemini
    }

    if (!aiResponse) {
      throw new Error("Failed to generate response from AI");
    }

    // Parse response dari AI
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    // Try to repair truncated JSON if it ends abruptly
    if (!cleanedResponse.endsWith("]") && !cleanedResponse.endsWith("}")) {
      console.warn("⚠️  Response appears truncated, attempting to repair...");
      // Find the last complete job object
      const lastCompleteObj = cleanedResponse.lastIndexOf("}");
      if (lastCompleteObj > 0) {
        cleanedResponse =
          cleanedResponse.substring(0, lastCompleteObj + 1) + "]";
        console.log("🔧 Repaired JSON by truncating to last complete object");
      }
    }

    let matchedJobs;
    try {
      matchedJobs = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        "❌ JSON parse failed, raw response:",
        cleanedResponse.substring(0, 500)
      );
      throw parseError;
    }
    console.log(
      `✅ AI successfully matched and scored ${matchedJobs.length} jobs`
    );

    // Validate that we got all jobs back
    if (matchedJobs.length !== jobsData.length) {
      console.warn(
        `⚠️  Expected ${jobsData.length} jobs but got ${matchedJobs.length}`
      );
    }

    // Sort by match score descending
    matchedJobs.sort(
      (a: { matchScore?: number }, b: { matchScore?: number }) =>
        (b.matchScore || 0) - (a.matchScore || 0)
    );

    return matchedJobs;
  } catch (aiError) {
    console.error("❌ AI matching failed:");
    console.error(
      "Error details:",
      aiError instanceof Error ? aiError.message : aiError
    );
    console.error("Stack:", aiError instanceof Error ? aiError.stack : "N/A");
    console.log("🔄 Falling back to basic job list without AI scoring");

    // Fallback: Return all jobs with basic match score
    return jobsData.map((job, index) => ({
      ...job,
      matchScore: Math.max(50, 75 - index * 3), // Simple scoring: 75, 72, 69... minimum 50
      matchReason: `This ${job.position} position at ${job.company} in ${
        job.location
      } matches your search criteria for ${preferences.position}. ${
        job.salary
          ? `Salary: ${job.salary}.`
          : "Salary information not available - please check the job posting."
      }`,
    }));
  }
}
