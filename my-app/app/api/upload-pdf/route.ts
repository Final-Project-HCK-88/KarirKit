import { NextRequest, NextResponse } from "next/server";
import ResumeModel from "@/db/models/ResumeModel";
import cloudinary from "@/db/config/cloudinary";
import { getServerUser } from "@/helpers/auth";
import { JWTPayload } from "@/types/jwt";

export async function POST(request: NextRequest) {
  try {
    // Get logged in user
    const user = (await getServerUser()) as JWTPayload | null;
    if (!user || !user.userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    console.log("👤 User ID:", user.userId);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validasi file type (PDF atau gambar)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { message: "Only PDF or image files are allowed" },
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

    console.log("📄 Processing file:", file.name);
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Jika PDF, kirim ke n8n untuk extract text
    let extractedText = "";

    if (isPdf) {
      console.log("📄 PDF detected, sending to n8n for extraction...");
      try {
        console.log(
          "📤 Sending binary PDF to n8n:",
          process.env.N8N_WEBHOOK_URL
        );

        // Kirim sebagai pure binary (application/pdf)
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${file.name}"`,
          },
          body: imageBuffer, // Kirim Buffer langsung sebagai binary
        });

        console.log("📥 n8n response status:", n8nResponse.status);

        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();
          console.log(
            "📊 n8n full response:",
            JSON.stringify(n8nData, null, 2)
          );

          // Handle berbagai kemungkinan struktur dari n8n
          // Bisa berupa object langsung atau nested
          let textData = n8nData;

          // Jika response adalah array, ambil item pertama
          if (Array.isArray(n8nData)) {
            console.log("📦 n8n returned array, taking first item");
            textData = n8nData[0] || {};
          }

          // Coba berbagai kemungkinan field name
          extractedText =
            textData.extractedText ||
            textData.text ||
            textData.content ||
            textData.result ||
            textData.data?.extractedText ||
            textData.data?.text ||
            JSON.stringify(textData); // Fallback: stringify entire response

          console.log(
            "✅ Text extracted by n8n, length:",
            extractedText.length
          );
          console.log("📝 Text preview:", extractedText.substring(0, 200));

          if (extractedText.length === 0 || extractedText === "{}") {
            console.warn("⚠️ All fields empty, response:", n8nData);
            extractedText = "[N8N returned empty text]";
          }
        } else {
          const errorText = await n8nResponse.text();
          console.error(
            "❌ n8n extraction failed:",
            n8nResponse.status,
            errorText
          );
          extractedText = `[N8N extraction failed - ${n8nResponse.statusText}]`;
        }
      } catch (error) {
        console.error("❌ Error calling n8n:", error);
        extractedText = `[N8N extraction error: ${error}]`;
      }
    } else {
      // Jika gambar, set placeholder
      extractedText = `[Image file - OCR not implemented yet]\nFile: ${file.name}`;
    }

    // Upload ke Cloudinary
    console.log("☁️ Uploading to Cloudinary...");
    const uploadResult = await new Promise<{
      url: string;
      publicId: string;
    }>((resolve, reject) => {
      const uploadOptions = isPdf
        ? {
            resource_type: "image" as const,
            folder: "karirkit/cv-images",
            format: "png", // Convert PDF to PNG
            pages: true, // Get all pages
          }
        : {
            resource_type: "image" as const,
            folder: "karirkit/cv-images",
          };

      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else if (result)
            resolve({ url: result.secure_url, publicId: result.public_id });
          else reject(new Error("Upload failed"));
        })
        .end(imageBuffer);
    });

    const imageUrl = uploadResult.url;
    console.log("✅ Uploaded to Cloudinary:", imageUrl);

    // Kirim ke n8n untuk OCR/analysis (skipped - already extracted above)
    console.log("📝 Extracted text length:", extractedText.length);

    // Simpan ke MongoDB dengan userId
    console.log("💾 Saving to MongoDB with userId:", user.userId);
    const resume = await ResumeModel.create({
      userId: user.userId,
      fileName: file.name,
      fileUrl: imageUrl,
      cloudinaryPublicId: uploadResult.publicId,
      extractedText: extractedText,
      fileSize: file.size,
    });

    console.log("✅ Resume saved with ID:", resume._id);

    return NextResponse.json(
      {
        message: "File uploaded and processed successfully",
        data: {
          resumeId: resume._id.toString(),
          fileUrl: imageUrl,
          fileName: file.name,
          fileSize: file.size,
          textExtracted: extractedText.length > 0,
          textLength: extractedText.length,
          textPreview: extractedText.substring(0, 200),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload file", error: String(error) },
      { status: 500 }
    );
  }
}
