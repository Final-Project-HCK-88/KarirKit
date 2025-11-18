import UserPreferencesModel from "@/db/models/UserPreferencesModel";
import errorHandler from "@/helpers/errHandler";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get userId from middleware-injected header
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. User ID not found." },
        { status: 401 }
      );
    }

    const history = await UserPreferencesModel.getByUserId(userId, 10);

    // Convert ObjectId to string for each history item
    const formattedHistory = history.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      userId: item.userId.toString(),
    }));

    return NextResponse.json(
      { message: "History retrieved", data: formattedHistory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /match-making:", error);
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get userId from middleware-injected header
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. User ID not found." },
        { status: 401 }
      );
    }

    const preferences = await request.json();
    console.log({ userId, preferences }, "<<< USER PREFERENCES DATA");

    const createdPreferences = await UserPreferencesModel.createPreferences(
      userId,
      preferences
    );

    return NextResponse.json(
      {
        createdPreferences: {
          ...createdPreferences,
          id: createdPreferences.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST match-making API route:", error);
    return errorHandler(error);
  }
}
