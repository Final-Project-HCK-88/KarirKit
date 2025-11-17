import { verifyToken } from "@/helpers/jwt";
import UserModel from "@/db/models/UserModel";
import cloudinary from "@/helpers/cloudinary";
import errorHandler from "@/helpers/errHandler";
import { NextResponse } from "next/server";
import { JWTPayload } from "@/types/jwt";

export async function GET(request: Request) {
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
    const user = await UserModel.getByEmail(decoded.email);

    return NextResponse.json(
      {
        fullname: user.fullname,
        email: user.email,
        image: user.image,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(request: Request) {
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

    const formData = await request.formData();
    const fullname = formData.get("fullname") as string;
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (file) {
      // Convert File → Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload ke Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "karirkit" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // Update MongoDB
    await UserModel.updateProfile(decoded.email, {
      fullname,
      ...(imageUrl && { image: imageUrl }),
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        image: imageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
