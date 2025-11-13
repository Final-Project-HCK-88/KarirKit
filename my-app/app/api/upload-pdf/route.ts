import { NextRequest, NextResponse } from "next/server";
import { uploadPdfToCloudinary } from "@/helpers/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validasi file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validasi file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload ke Cloudinary
    const result = await uploadPdfToCloudinary(file);

    return NextResponse.json(
      {
        message: "PDF uploaded successfully",
        data: {
          url: result.url,
          publicId: result.publicId,
          fileName: file.name,
          fileSize: file.size,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload PDF", error: String(error) },
      { status: 500 }
    );
  }
}
