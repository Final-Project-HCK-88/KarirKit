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
