import { NextRequest, NextResponse } from "next/server";
import SalaryRequestModel from "@/db/models/SalaryRequestModel";
import errorHandler from "@/helpers/errHandler";

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

    const history = await SalaryRequestModel.getByUserId(userId, 10);

    // Convert ObjectId to string for each history item
    const formattedHistory = history.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(
      { message: "History retrieved", data: formattedHistory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /sallary-benchmark:", error);
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

    const body = await request.json();
    const payload = { ...body, userId };
    const created = await SalaryRequestModel.create(payload as any);

    return NextResponse.json(
      {
        message: "Request saved",
        request: {
          ...created,
          _id: created._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /sallary-benchmark:", error);
    return errorHandler(error);
  }
}
