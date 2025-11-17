import { NextResponse } from "next/server";
import errorHandler from "@/helpers/errHandler";

export async function POST() {
  try {
    // Client-side akan handle penghapusan token dari localStorage
    // Server-side logout tidak perlu logic khusus untuk stateless JWT
    return NextResponse.json(
      {
        message: "Logout successful. Please remove token from client storage.",
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
