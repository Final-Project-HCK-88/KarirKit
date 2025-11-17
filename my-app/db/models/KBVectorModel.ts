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
  static async knnSearch(
    embedding: number[],
    k = 15,
    options?: {
      minScore?: number; // Threshold untuk filter hasil dengan score rendah
      numCandidates?: number; // Custom numCandidates untuk precision/recall trade-off
    }
  ) {
    const indexName = process.env.ATLAS_VECTOR_INDEX_NAME || "vector_index";

    // Increase numCandidates untuk better recall (lebih banyak kandidat = hasil lebih akurat)
    // Rule of thumb: numCandidates = k * 20 untuk balance antara speed & accuracy
    const numCandidates = options?.numCandidates || Math.max(k * 20, 150);

    const pipeline = [
      {
        $vectorSearch: {
          index: indexName,
          path: "embedding",
          queryVector: embedding,
          numCandidates: numCandidates,
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

    // Add score filtering stage if minScore is specified
    if (options?.minScore && options.minScore > 0) {
      pipeline.push({
        $match: {
          score: { $gte: options.minScore },
        },
      } as any);
    }

    const cursor = this.collection().aggregate(pipeline);
    const results = await cursor.toArray();

    // Log untuk monitoring kualitas hasil
    if (results.length > 0) {
      const avgScore =
        results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
      console.log(
        `Vector search: ${
          results.length
        } results, avg score: ${avgScore.toFixed(4)}`
      );
    }

    return results;
  }

  /**
   * Hybrid search: Combine vector similarity with keyword matching
   * untuk akurasi lebih tinggi
   */
  static async hybridSearch(
    embedding: number[],
    keywords: string[],
    k = 15,
    options?: {
      vectorWeight?: number; // 0-1, default 0.7
      keywordWeight?: number; // 0-1, default 0.3
      minScore?: number;
    }
  ) {
    const vectorWeight = options?.vectorWeight || 0.7;
    const keywordWeight = options?.keywordWeight || 0.3;

    // Get vector search results
    const vectorResults = await this.knnSearch(embedding, k * 2, options);

    // Get keyword search results (text search)
    const keywordPipeline = [
      {
        $search: {
          index: "default", // Pastikan ada text index
          text: {
            query: keywords.join(" "),
            path: ["text", "chunkText"],
            fuzzy: {
              maxEdits: 1, // Allow typos
            },
          },
        },
      },
      {
        $limit: k * 2,
      },
      {
        $project: {
          text: 1,
          chunkText: 1,
          source: 1,
          sourceFile: 1,
          metadata: 1,
          keywordScore: { $meta: "searchScore" },
        },
      },
    ];

    interface SearchResult {
      _id: ObjectId;
      score?: number;
      keywordScore?: number;
      combinedScore: number;
      vectorScore: number;
      [key: string]: unknown;
    }

    let keywordResults: SearchResult[] = [];
    try {
      const cursor = this.collection().aggregate(keywordPipeline);
      keywordResults = (await cursor.toArray()) as SearchResult[];
    } catch (err) {
      console.warn("Keyword search failed, using vector-only:", err);
      return vectorResults.slice(0, k);
    }

    // Merge and rerank results
    const mergedResults = new Map<string, SearchResult>();

    // Normalize vector scores
    const maxVectorScore = Math.max(
      ...vectorResults.map((r) => r.score || 0),
      1
    );
    vectorResults.forEach((result) => {
      const id = result._id.toString();
      const normalizedScore = (result.score || 0) / maxVectorScore;
      mergedResults.set(id, {
        ...result,
        combinedScore: normalizedScore * vectorWeight,
        vectorScore: result.score || 0,
        keywordScore: 0,
      } as SearchResult);
    });

    // Add keyword scores
    const maxKeywordScore = Math.max(
      ...keywordResults.map((r) => Number(r.keywordScore) || 0),
      1
    );
    keywordResults.forEach((result) => {
      const id = result._id.toString();
      const normalizedScore =
        (Number(result.keywordScore) || 0) / maxKeywordScore;

      if (mergedResults.has(id)) {
        const existing = mergedResults.get(id);
        if (existing) {
          existing.combinedScore =
            Number(existing.combinedScore) + normalizedScore * keywordWeight;
          existing.keywordScore = Number(result.keywordScore) || 0;
        }
      } else {
        mergedResults.set(id, {
          ...result,
          combinedScore: normalizedScore * keywordWeight,
          vectorScore: 0,
          keywordScore: Number(result.keywordScore) || 0,
        } as SearchResult);
      }
    });

    // Sort by combined score and return top k
    const sortedResults = Array.from(mergedResults.values())
      .sort((a, b) => Number(b.combinedScore) - Number(a.combinedScore))
      .slice(0, k);

    console.log(
      `Hybrid search: ${sortedResults.length} results (vector + keyword)`
    );

    return sortedResults;
  }
}

export default KBVectorModel;
