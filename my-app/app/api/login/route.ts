import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errHandler";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const data = await UserModel.login({ email, password });

    console.log(data, "<<< DATA TOKEN");

    return NextResponse.json(
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
