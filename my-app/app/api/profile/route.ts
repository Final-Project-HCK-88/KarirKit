import { cookies } from "next/headers";
import { verifyToken } from "@/helpers/jwt";
import UserModel from "@/db/models/UserModel";
import cloudinary from "@/helpers/cloudinary";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const decoded = verifyToken(token) as { email: string };
    const user = await UserModel.getByEmail(decoded.email);

    return new Response(
      JSON.stringify({
        fullname: user.fullname,
        email: user.email,
        image: user.image,
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ message: error.message || "Internal Error" }),
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const decoded = verifyToken(token) as { email: string };

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

    return new Response(
      JSON.stringify({
        message: "Profile updated successfully",
        image: imageUrl,
      }),
      { status: 200 }
    );
  } catch (err) {
    const e = err as { message?: string; status?: number };
    return new Response(
      JSON.stringify({ message: e.message ?? "Internal Error" }),
      { status: e.status ?? 500 }
    );
  }
}
