import { ObjectId } from "mongodb";
import { database } from "../config/mongodb";

export interface CV {
  _id?: ObjectId;
  userId: ObjectId;
  link: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export default class CVModel {
  static collection() {
    return database.collection<CV>("CVS");
  }

  static async create(data: {
    userId: ObjectId;
    link: string;
    text: string;
  }): Promise<CV> {
    const collection = this.collection();
    const cv: CV = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(cv);
    return { ...cv, _id: result.insertedId };
  }

  static async findByUserId(userId: ObjectId): Promise<CV | null> {
    const collection = this.collection();
    return await collection.findOne({ userId });
  }

  static async updateByUserId(
    userId: ObjectId,
    data: { link: string; text: string }
  ): Promise<CV | null> {
    const collection = this.collection();
    const result = await collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  static async deleteByUserId(userId: ObjectId): Promise<boolean> {
    const collection = this.collection();
    const result = await collection.deleteOne({ userId });
    return result.deletedCount > 0;
  }
}
