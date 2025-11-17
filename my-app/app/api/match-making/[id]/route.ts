import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import errorHandler from "@/helpers/errHandler";
import { matchJobsWithAIRealtime } from "@/helpers/geminiai";
import { verifyToken } from "@/helpers/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: preferencesId } = await params;
    console.log({ preferencesId }, "<<< GET MATCH-MAKING DATA");

    if (!preferencesId) {
      return NextResponse.json(
        { message: "User Preferences ID is required" },
        { status: 400 }
      );
    }

    // Verifikasi token - REQUIRED
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    let loggedInUserId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token) as { userId: string };
      loggedInUserId = decoded.userId;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { message: "Invalid or expired token. Please login again." },
        { status: 401 }
      );
    }

    // Ambil preferences user dari database dan validasi bahwa preferences ini milik user yang login
    const preferences = await UserPreferencesModel.getPreferencesById(
      preferencesId,
      loggedInUserId
    );

    if (!preferences) {
      return NextResponse.json(
        {
          message: "User preferences not found or you don't have access to it.",
        },
        { status: 404 }
      );
    }

    // Match jobs using REAL-TIME data from LinkedIn + Gemini AI
    console.log(
      "Fetching real-time jobs from LinkedIn and matching with AI..."
    );
    let jobListings;
    try {
      jobListings = await matchJobsWithAIRealtime({
        location: preferences.location,
        industry: preferences.industry,
        expectedSalary: preferences.expectedSalary,
        skill: preferences.skill,
        position: preferences.position,
      });
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

    return NextResponse.json(
      {
        message: "Real-time job matching completed successfully",
        source: "LinkedIn + Gemini AI",
        preferences,
        jobListings,
        totalJobs: jobListings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET match-making API route:", error);
    return errorHandler(error);
  }
}
