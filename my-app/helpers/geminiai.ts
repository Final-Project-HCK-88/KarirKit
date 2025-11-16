import { GoogleGenAI } from "@google/genai";
import { fetchJobsByPreferences, LinkedInJob } from "./linkedinJobs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateGeminiContent(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

// Create embeddings using Google AI (Gemini) or OpenAI API
// Gemini is preferred as primary, with OpenAI as fallback
export async function generateGeminiEmbedding(input: string | string[]) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // Try Gemini first if available (primary)
  if (geminiApiKey) {
    try {
      console.log("Using Gemini embeddings (primary)...");
      const model =
        process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
      console.log(`Using Gemini model: ${model}`);
      const text = Array.isArray(input) ? input[0] : input;

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
 * Flow: User preferences → Fetch from LinkedIn → AI filtering → Top 5 matches
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

  // Format jobs data for AI
  const jobsData = linkedInJobs.map((job: LinkedInJob, index: number) => ({
    id: job.jobId || `linkedin-${index}`,
    position: job.position,
    company: job.company,
    companyLogo: job.companyLogo,
    location: job.location,
    date: job.date,
    salary: job.salary,
    jobUrl: job.jobUrl,
  }));

  // Create AI prompt for intelligent filtering
  const prompt = `
You are an expert job matching AI assistant. Based on the user preferences below, analyze the available jobs from LinkedIn and select the TOP 5 BEST MATCHES.

User Preferences:
- Location: ${preferences.location}
- Industry: ${preferences.industry}
- Expected Salary: ${preferences.expectedSalary} (in IDR)
- Skills: ${skillsArray.length > 0 ? skillsArray.join(", ") : "Not specified"}
- Position: ${preferences.position}

Available Jobs from LinkedIn:
${JSON.stringify(jobsData, null, 2)}

Instructions:
1. Analyze each job against the user preferences
2. Consider matching factors:
   - Job title relevance to the desired position
   - Location match (consider remote, hybrid, on-site)
   - Salary alignment (if provided)
   - Industry alignment (infer from job title and company)
   - Skills match (infer required skills from job title and description)
   - Company reputation and size
   - Date posted (prefer recent postings)
3. Select the TOP 5 jobs that best match the user preferences
4. Rank them by match quality (best match first)
5. For each selected job, add:
   - "matchScore" (0-100): Overall match quality score
   - "matchReason": Brief explanation (2-3 sentences) why it's a good fit

Return ONLY a valid JSON array with exactly 5 best matching jobs. Each job should include all original fields plus:
- matchScore: number between 0-100
- matchReason: string explaining the match

IMPORTANT: Return ONLY the JSON array without any markdown formatting, code blocks, or additional text.
`;

  console.log("Sending jobs to Gemini AI for intelligent matching...");
  const aiResponse = await generateGeminiContent(prompt);

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

  const matchedJobs = JSON.parse(cleanedResponse);
  console.log(`AI matched and returned ${matchedJobs.length} best jobs`);

  return matchedJobs;
}
