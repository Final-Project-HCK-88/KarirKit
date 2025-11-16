import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getServerUser() {
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
