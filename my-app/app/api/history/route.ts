import { NextResponse } from "next/server";
import ResumeModel from "@/db/models/ResumeModel";
import { getServerUser } from "@/helpers/auth";
import { JWTPayload } from "@/types/jwt";

export async function GET() {
  try {
    // Get logged in user
    const user = (await getServerUser()) as JWTPayload | null;
    if (!user || !user.userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    console.log("📚 Fetching history for user:", user.userId);

    // Ambil semua resume milik user
    const resumes = await ResumeModel.findByUserId(user.userId);

    return NextResponse.json(
      {
        message: "History fetched successfully",
        data: {
          userId: user.userId,
          totalUploads: resumes.length,
          resumes: resumes.map((resume) => ({
            id: resume._id.toString(),
            fileName: resume.fileName,
            fileUrl: resume.fileUrl,
            fileSize: resume.fileSize,
            textLength: resume.extractedText?.length || 0,
            uploadedAt: resume.uploadedAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch history",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
