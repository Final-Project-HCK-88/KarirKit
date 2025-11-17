import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import errorHandler from "@/helpers/errHandler";
import { verifyToken } from "@/helpers/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verifikasi token - REQUIRED
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { message: "Invalid or expired token. Please login again." },
        { status: 401 }
      );
    }

    const preferences = await request.json();
    console.log({ userId, preferences }, "<<< USER PREFERENCES DATA");

    const createdPreferences = await UserPreferencesModel.createPreferences(
      userId,
      preferences
    );

    return NextResponse.json({ createdPreferences }, { status: 201 });
  } catch (error) {
    console.error("Error in POST match-making API route:", error);
    return errorHandler(error);
  }
}
