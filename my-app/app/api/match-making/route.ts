import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import errorHandler from "@/helpers/errHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const preferences = await request.json();
    console.log({ userId, preferences }, "<<< WISHLIST DATA");

    if (!userId) {
      return NextResponse.json(
        { message: "Please log in first" },
        { status: 401 }
      );
    }
    const createdPreferences = await UserPreferencesModel.createPreferences(
      userId,
      preferences
    );

    return NextResponse.json({ createdPreferences }, { status: 201 });
  } catch (error) {
    console.error("Error in POST wishlist API route:", error);
    return errorHandler(error);
  }
}
