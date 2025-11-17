import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errHandler";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  try {
    const data = await UserModel.login({ email, password });

    console.log(data, "<<< DATA TOKEN");

    if (data.token) {
      const cookiesStore = await cookies();
      cookiesStore.set("Authorization", `Bearer ${data.token}`);
    }

    return Response.json(
      {
        message: "User logged in successfully",
        access_token: data.token,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
