import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

type AnalysisType = {
  userId: string;
  resumeId: string;
  analysisType: "contract" | "cv" | "general";
  result: {
    summary: string;
    contractInfo?: {
      position: string;
      company: string;
      contractType: string;
      startDate: string;
      duration: string;
    };
    salary?: {
      amount: string;
      currency: string;
      frequency: string;
      additionalBenefits: string[];
    };
    workingConditions?: {
      workingHours: string;
      location: string;
      remotePolicy: string;
    };
    keyTerms?: Array<{
      term: string;
      description: string;
    }>;
    warnings?: Array<{
      severity: string;
      clause: string;
      issue: string;
      recommendation: string;
    }>;
    redFlags?: string[];
    recommendations: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

class AnalysisModel {
  static collection() {
    return database.collection("analyses");
  }

  static async create(analysis: Omit<AnalysisType, "createdAt" | "updatedAt">) {
    const newAnalysis = {
      ...analysis,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection().insertOne(newAnalysis);
    return {
      _id: result.insertedId,
      ...newAnalysis,
    };
  }

  static async findById(id: string) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByResumeId(resumeId: string) {
    return await this.collection()
      .find({ resumeId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
  }

  static async findByUserId(userId: string) {
    return await this.collection()
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async updateAnalysis(id: string, result: AnalysisType["result"]) {
    return await this.collection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          result,
          updatedAt: new Date(),
        },
      }
    );
  }

  static async deleteById(id: string) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async deleteByResumeId(resumeId: string) {
    const result = await this.collection().deleteMany({ resumeId });
    return result.deletedCount;
  }

  static async findByResumeIdAndUserId(resumeId: string, userId: string) {
    return await this.collection()
      .find({ resumeId, userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
  }
}

export default AnalysisModel;
