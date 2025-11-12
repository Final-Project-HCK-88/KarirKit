// import UserModel from "@/db/models/UserModel";
// import errorHandler from "@/helpers/errHandler";

// export async function POST(request: Request) {
//     const { fullname, name, email, password } = await request.json();
//   try {
//     const data = await UserModel.create({ fullname, name, email, password });
//     return Response.json(
//       {
//         message: "User registered successfully",
//         data,
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     return errorHandler(error);
//   }
// }