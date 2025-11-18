import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import CacheModel from "@/db/models/CacheModel";
import errorHandler from "@/helpers/errHandler";
import { matchJobsWithAIRealtime } from "@/helpers/geminiai";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: preferencesId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    console.log({ preferencesId, page, limit }, "<<< GET MATCH-MAKING DATA");

    if (!preferencesId) {
      return NextResponse.json(
        { message: "User Preferences ID is required" },
        { status: 400 }
      );
    }

    // Get userId from middleware-injected header
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. User ID not found." },
        { status: 401 }
      );
    }

    // Ambil preferences user dari database dan validasi bahwa preferences ini milik user yang login
    const preferences = await UserPreferencesModel.getPreferencesById(
      preferencesId,
      userId
    );

    if (!preferences) {
      return NextResponse.json(
        {
          message: "User preferences not found or you don't have access to it.",
        },
        { status: 404 }
      );
    }

    // Prepare cache key from preferences
    const cachePreferences = {
      location: preferences.location,
      industry: preferences.industry,
      expectedSalary: preferences.expectedSalary,
      skill: preferences.skill,
      position: preferences.position,
    };

    // Check cache first
    const cachedResult = await CacheModel.getCached(
      "job_matching",
      cachePreferences
    );

    if (cachedResult) {
      console.log("✅ Returning cached job matching result");

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedJobs = cachedResult.slice(startIndex, endIndex);
      const totalPages = Math.ceil(cachedResult.length / limit);

      return NextResponse.json(
        {
          message: "Job matching retrieved from cache",
          source: "Cache (LinkedIn + Gemini AI)",
          preferences,
          jobListings: paginatedJobs,
          totalJobs: cachedResult.length,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          cached: true,
        },
        { status: 200 }
      );
    }

    console.log("🔄 Cache miss, fetching real-time jobs from LinkedIn...");

    // Match jobs using REAL-TIME data from LinkedIn + Gemini AI
    let jobListings;
    try {
      jobListings = await matchJobsWithAIRealtime(cachePreferences);
    } catch (matchError) {
      console.error("Error matching jobs with AI:", matchError);
      return NextResponse.json(
        {
          message: "Failed to match jobs. Please try again.",
          error:
            matchError instanceof Error ? matchError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Save ALL jobs to cache (12 hours TTL for job listings as they change more frequently)
    await CacheModel.setCache(
      "job_matching",
      cachePreferences,
      jobListings,
      12
    );

    // Apply pagination to response
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = jobListings.slice(startIndex, endIndex);
    const totalPages = Math.ceil(jobListings.length / limit);

    return NextResponse.json(
      {
        message: "Real-time job matching completed successfully",
        source: "LinkedIn + Gemini AI",
        preferences,
        jobListings: paginatedJobs,
        totalJobs: jobListings.length,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        cached: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET match-making API route:", error);
    return errorHandler(error);
  }
}
