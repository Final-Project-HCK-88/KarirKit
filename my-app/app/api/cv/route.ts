import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import CVModel from "@/db/models/CVModel";
import UserModel from "@/db/models/UserModel";

// GET /api/cv - Get user's CV
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const userEmail = request.headers.get("X-User-Email");

    console.log("🔒 Protected endpoint: /api/cv");
    console.log("📧 User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const cv = await CVModel.findByUserId(new ObjectId(userId));

    if (!cv) {
      return NextResponse.json(
        { error: "CV not found", hasCV: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasCV: true,
      cv: {
        _id: cv._id,
        link: cv.link,
        text: cv.text,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching CV:", error);
    return NextResponse.json({ error: "Failed to fetch CV" }, { status: 500 });
  }
}

// POST /api/cv - Upload or update user's CV
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const userEmail = request.headers.get("X-User-Email");

    console.log("🔒 Protected endpoint: /api/cv (POST)");
    console.log("📧 User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { link, text } = body;

    if (!link || !text) {
      return NextResponse.json(
        { error: "Link and text are required" },
        { status: 400 }
      );
    }

    console.log("📄 Uploading CV for user:", userId);
    console.log("🔗 CV Link:", link);
    console.log("📝 Text length:", text.length);

    // Check if CV already exists
    const existingCV = await CVModel.findByUserId(new ObjectId(userId));

    let cv;
    if (existingCV) {
      // Update existing CV
      console.log("♻️ Updating existing CV");
      cv = await CVModel.updateByUserId(new ObjectId(userId), { link, text });
    } else {
      // Create new CV
      console.log("✨ Creating new CV");
      cv = await CVModel.create({
        userId: new ObjectId(userId),
        link,
        text,
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
      cv: {
        _id: cv._id,
        link: cv.link,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading CV:", error);
    return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
  }
}

// DELETE /api/cv - Delete user's CV
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");
    const userEmail = request.headers.get("X-User-Email");

    console.log("🔒 Protected endpoint: /api/cv (DELETE)");
    console.log("📧 User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user ID" },
        { status: 401 }
      );
    }

    const deleted = await CVModel.deleteByUserId(new ObjectId(userId));

    if (!deleted) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Remove user's userCV reference
    await UserModel.collection().updateOne(
      { _id: new ObjectId(userId) },
      { $set: { userCV: null } }
    );

    console.log("✅ CV deleted successfully");

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting CV:", error);
    return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
  }
}
