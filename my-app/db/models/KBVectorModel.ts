import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

class KBVectorModel {
  static collection() {
    return database.collection("kb_vectors");
  }

  static async insertMany(docs: any[]) {
    if (!Array.isArray(docs) || docs.length === 0) return [];
    const result = await this.collection().insertMany(docs);
    return result.insertedIds;
  }

  static async insertOne(doc: any) {
    const result = await this.collection().insertOne(doc);
    return { id: result.insertedId, ...doc };
  }

  // search using Atlas Vector Search ($vectorSearch). Expects embedding vector and k
  static async knnSearch(embedding: number[], k = 15) {
    const indexName = process.env.ATLAS_VECTOR_INDEX_NAME || "vector_index";

    const pipeline = [
      {
        $vectorSearch: {
          index: indexName,
          path: "embedding",
          queryVector: embedding,
          numCandidates: Math.max(k * 10, 100), // numCandidates should be >= limit (increased for better recall)
          limit: k,
        },
      },
      {
        $project: {
          text: 1, // n8n stores text content here
          chunkText: 1, // fallback field name
          source: 1, // n8n stores source here
          sourceFile: 1, // fallback field name
          loc: 1, // n8n stores line/page info here
          metadata: 1, // additional metadata
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const cursor = this.collection().aggregate(pipeline);
    const results = await cursor.toArray();
    return results;
  }
}

export default KBVectorModel;
