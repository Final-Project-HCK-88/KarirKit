import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";

const SalaryRequest = z.object({
  jobTitle: z.string().min(1),
  location: z.string().min(1),
  experienceYear: z.number().min(0),
  currentOrOfferedSallary: z.number().min(0),
  userId: z.string().optional(),
});

type SalaryRequestType = z.infer<typeof SalaryRequest>;

class SalaryRequestModel {
  static collection() {
    return database.collection("salary_requests");
  }

  static async create(request: SalaryRequestType) {
    SalaryRequest.parse(request);
    const result = await this.collection().insertOne({
      ...request,
      createdAt: new Date(),
    });
    return { id: result.insertedId, ...request };
  }

  static async getById(id: string) {
    try {
      const _id = new ObjectId(id);
      const doc = await this.collection().findOne({ _id });
      return doc;
    } catch (err) {
      return null;
    }
  }
}

export default SalaryRequestModel;
