import { z } from "zod";
import { database } from "../config/mongodb";
import { comparePassword, hashPassword } from "@/helpers/bcrypt";
import { signToken } from "@/helpers/jwt";

const User = z.object({
  fullname: z.string().min(3, "Fullname must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UserType = z.infer<typeof User>;

class UserModel {
  static collection() {
    return database.collection("users");
  }

  static async create(newUser: UserType) {
    User.parse(newUser);
    const existingUser = await this.collection().findOne({ email: newUser.email });
    if (existingUser) {
      throw { message: "Email or username already in use", status: 400 };
    }
    const hashedPassword = hashPassword(newUser.password);
    newUser.password = hashedPassword;
    const result = await this.collection().insertOne(newUser);
    return {
      id: result.insertedId,
      ...newUser,
    };
  }

  static async login({ email, password }: { email: string; password: string }) {
    const user = await this.collection().findOne({ email });
    if (!user) {
      throw { message: "Invalid email or password", status: 401 };
    }
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const token = signToken({ id: user._id, email: user.email });
    return { token };
  }
}

export default UserModel;
