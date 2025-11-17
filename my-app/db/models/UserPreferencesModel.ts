import { ObjectId } from "mongodb";
import { database } from "../config/mongodb";
import { z } from "zod";

const UserPreferences = z.object({
  location: z.string().min(3, "Fullname must be at least 3 characters"),
  industry: z.string().min(3, "Industry must be at least 3 characters"),
  expectedSalary: z
    .number()
    .min(0, "Expected salary must be a positive number"),
  skill: z.array(z.string()).optional(),
  position: z.string().min(3, "Position must be at least 3 characters"),
});

type UserPreferencesType = z.infer<typeof UserPreferences>;

class UserPreferencesModel {
  static collection() {
    return database.collection("user_preferences");
  }

  static async createPreferences(
    userId: string,
    preferences: UserPreferencesType
  ) {
    const result = await this.collection().insertOne({
      userId: new ObjectId(userId),
      ...preferences,
    });
    return {
      id: result.insertedId,
      userId,
      ...preferences,
    };
  }

  static async getPreferencesByUserPreferencesId(userId: string) {
    const preferences = await this.collection().findOne({
      userId: new ObjectId(userId),
    });

    return preferences;
  }

  static async getPreferencesById(preferencesId: string, userId?: string) {
    const query: { _id: ObjectId; userId?: ObjectId } = {
      _id: new ObjectId(preferencesId),
    };

    // Jika userId diberikan, tambahkan ke query untuk validasi
    if (userId) {
      query.userId = new ObjectId(userId);
    }

    const preferences = await this.collection().findOne(query);
    return preferences;
  }
}

export default UserPreferencesModel;
