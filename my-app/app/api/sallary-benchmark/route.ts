import { NextRequest, NextResponse } from "next/server";
import SalaryRequestModel from "@/db/models/SalaryRequestModel";
import errorHandler from "@/helpers/errHandler";
import { verifyToken } from "@/helpers/jwt";
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

    const body = await request.json();
    const payload = { ...body, userId };
    const created = await SalaryRequestModel.create(payload as any);

    return NextResponse.json(
      { message: "Request saved", request: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /sallary-benchmark:", error);
    return errorHandler(error);
  }
}
