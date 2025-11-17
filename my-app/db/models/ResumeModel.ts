import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

type ResumeType = {
  userId?: string;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  extractedText: string;
  fileSize: number;
  uploadedAt: Date;
};

class ResumeModel {
  static collection() {
    return database.collection("resumes");
  }

  static async create(resume: Omit<ResumeType, "uploadedAt">) {
    const newResume = {
      ...resume,
      uploadedAt: new Date(),
    };

    const result = await this.collection().insertOne(newResume);
    return {
      _id: result.insertedId,
      ...newResume,
    };
  }

  static async findById(id: string) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId: string) {
    return await this.collection().find({ userId }).toArray();
  }

  static async updateExtractedText(id: string, extractedText: string) {
    return await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { extractedText } }
    );
  }
}

export default ResumeModel;
