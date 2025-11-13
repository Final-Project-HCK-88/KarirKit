import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { database } from "@/db/config/mongodb";
import { signToken } from "@/helpers/jwt";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.Client_ID as string,
      clientSecret: process.env.Client_Secret as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Koneksi ke MongoDB
        const usersCollection = database.collection("users");

        // Cek apakah user sudah ada berdasarkan email
        let dbUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!dbUser) {
          // Jika user belum ada, simpan ke database
          const result = await usersCollection.insertOne({
            fullname: user.name || "",
            email: user.email,
            password: "", // Kosongkan karena login via Google
            googleId: account?.providerAccountId,
            image: user.image,
            provider: "google",
            createdAt: new Date(),
          });
          console.log("New user saved to MongoDB:", user.email);

          // Ambil user yang baru dibuat
          dbUser = await usersCollection.findOne({ _id: result.insertedId });
        } else {
          console.log("User already exists:", user.email);
        }

        // Generate JWT token dan simpan di cookies
        if (dbUser) {
          const jwtToken = signToken({
            id: dbUser._id.toString(),
            email: dbUser.email,
            fullname: dbUser.fullname,
          });

          const cookieStore = await cookies();
          cookieStore.set("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 hari
            path: "/",
          });
          console.log("JWT token saved to cookies");
        }

        return true;
      } catch (error) {
        console.error("Error saving user to MongoDB:", error);
        return false;
      }
    },
    async session({ session }) {
      // Tambahkan informasi tambahan ke session
      if (session.user) {
        // Ambil user dari database untuk mendapatkan _id
        const usersCollection = database.collection("users");
        const dbUser = await usersCollection.findOne({
          email: session.user.email,
        });

        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  events: {
    async signOut() {
      // Hapus token dari cookies saat logout
      const cookieStore = await cookies();
      cookieStore.delete("token");
      console.log("JWT token removed from cookies");
    },
  },
  pages: {
    signIn: "/", // Redirect ke home page untuk login
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
