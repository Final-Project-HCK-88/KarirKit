import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import errorHandler from "@/helpers/errHandler";
import { verifyToken } from "@/helpers/jwt";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "@/types/jwt";

export async function POST(request: NextRequest) {
  try {
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
