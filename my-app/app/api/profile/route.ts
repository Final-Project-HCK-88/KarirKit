import { cookies } from "next/headers";
import { verifyToken } from "@/helpers/jwt";
import UserModel from "@/db/models/UserModel";

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    const decoded = verifyToken(token) as { email: string };
    const { fullname, image } = await request.json();
    const usersCollection = UserModel.collection();
    await usersCollection.updateOne(
      { email: decoded.email },
      { $set: { fullname, image } }
    );

    return new Response(
      JSON.stringify({ message: "Profile updated successfully" }),
      { status: 200 }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ message: error.message || "Internal Error" }),
      { status: error.status || 500 }
    );
  }
}
