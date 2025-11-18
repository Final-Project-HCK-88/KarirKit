import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import CVModel from "@/db/models/CVModel";
import UserModel from "@/db/models/UserModel";
import cloudinary from "@/db/config/cloudinary";

// POST /api/cv/upload - Upload CV (PDF) for job matching & salary benchmark
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const userEmail = request.headers.get("X-User-Email");

    console.log("🔒 Protected endpoint: /api/cv/upload");
    console.log("📧 User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type (PDF only for CV)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed for CV upload" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    console.log("📄 Processing CV file:", file.name);
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using n8n
    let extractedText = "";
    console.log("📄 Sending PDF to n8n for text extraction...");

    try {
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${file.name}"`,
        },
        body: pdfBuffer,
      });

      console.log("📥 n8n response status:", n8nResponse.status);

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        console.log("📊 n8n response received");

        let textData = n8nData;
        if (Array.isArray(n8nData)) {
          textData = n8nData[0] || {};
        }

        extractedText =
          textData.extractedText ||
          textData.text ||
          textData.content ||
          textData.result ||
          textData.data?.extractedText ||
          textData.data?.text ||
          "";

        console.log("✅ Text extracted, length:", extractedText.length);
      } else {
        console.warn("⚠️ n8n extraction failed, will store without text");
      }
    } catch (error) {
      console.error("❌ n8n extraction error:", error);
      console.log("⚠️ Continuing without text extraction");
    }

    // Upload PDF to Cloudinary
    console.log("☁️ Uploading CV to Cloudinary...");
    const uploadResult = await new Promise<{ url: string; publicId: string }>(
      (resolve, reject) => {
        const uploadOptions = {
          resource_type: "raw" as const,
          folder: "karirkit/cvs",
          public_id: `cv_${userId}_${Date.now()}`,
        };

        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else if (result)
              resolve({ url: result.secure_url, publicId: result.public_id });
            else reject(new Error("Upload failed"));
          })
          .end(pdfBuffer);
      }
    );

    const cvUrl = uploadResult.url;
    console.log("✅ CV uploaded to Cloudinary:", cvUrl);

    // Save or update CV in database
    const existingCV = await CVModel.findByUserId(new ObjectId(userId));

    let cv;
    if (existingCV) {
      console.log("♻️ Updating existing CV");
      cv = await CVModel.updateByUserId(new ObjectId(userId), {
        link: cvUrl,
        text: extractedText,
      });
    } else {
      console.log("✨ Creating new CV");
      cv = await CVModel.create({
        userId: new ObjectId(userId),
        link: cvUrl,
        text: extractedText,
      });

      // Update user's userCV reference
      await UserModel.collection().updateOne(
        { _id: new ObjectId(userId) },
        { $set: { userCV: cv._id } }
      );
      console.log("✅ Updated user's userCV reference");
    }

    if (!cv) {
      return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: existingCV
        ? "CV updated successfully"
        : "CV uploaded successfully",
      url: cvUrl,
      extractedText: extractedText,
      textLength: extractedText.length,
      cv: {
        _id: cv._id,
        link: cv.link,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading CV:", error);
    return NextResponse.json(
      {
        error: "Failed to upload CV",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
