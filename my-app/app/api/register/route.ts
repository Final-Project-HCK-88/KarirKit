import UserModel from "@/db/models/UserModel";
import errorHandler from "@/helpers/errHandler";

export async function POST(request: Request) {
  const { fullname, email, password } = await request.json();
  console.log({ fullname, email, password }, "<<< REGISTER DATA");
  try {
    const data = await UserModel.create({ fullname, email, password });
    return Response.json(
      {
        message: "User registered successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
