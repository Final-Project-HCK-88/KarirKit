import UserModel from "@/db/models/UserModel";
import cloudinary from "@/helpers/cloudinary";
import errorHandler from "@/helpers/errHandler";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // User data already verified by middleware, get from injected headers
    const userId = request.headers.get("X-User-Id");
    const email = request.headers.get("X-User-Email");

    if (!userId || !email) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication token required." },
        { status: 401 }
      );
    }

    const user = await UserModel.getByEmail(email);

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
    // User data already verified by middleware, get from injected headers
    const userId = request.headers.get("X-User-Id");
    const email = request.headers.get("X-User-Email");

    if (!userId || !email) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication token required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const fullname = formData.get("fullname") as string;
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (file) {
      // Convert File → Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload ke Cloudinary
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "karirkit" }, (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error("Upload failed"));
            })
            .end(buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
    }

    // Update MongoDB
    const updatedUser = await UserModel.updateProfile(email, {
      fullname,
      ...(imageUrl && { image: imageUrl }),
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        data: {
          fullname: updatedUser.fullname,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
