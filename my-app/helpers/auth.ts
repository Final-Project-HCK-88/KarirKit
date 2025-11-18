import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { JWTPayload } from "@/types/jwt";

export async function getServerUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}
