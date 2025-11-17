import * as z from "zod";

export default function errorHandler(err: unknown) {
  console.error(err, "<<<<< ERR");
  const error = err as { message?: string; status?: number };

  if (err instanceof z.ZodError) {
    error.message = err.issues.map((issue) => issue.message).join(", ");
    error.status = 400;
  }
  return Response.json(
    { message: error.message },
    { status: error.status || 500 }
  );
}
