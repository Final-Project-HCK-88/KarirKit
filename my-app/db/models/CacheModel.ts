import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

interface CacheDocument {
  _id?: ObjectId;
  cacheKey: string;
  cacheType: "salary_benchmark" | "job_matching" | "cv_preferences";
  preferences: any;
  result: any;
  hitCount: number;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
}

class CacheModel {
  static collection() {
    return database.collection("cache_results");
  }

  /**
   * Generate cache key from preferences
   */
  static generateCacheKey(
    type: "salary_benchmark" | "job_matching" | "cv_preferences",
    preferences: any
  ): string {
    // Sort keys to ensure consistent hash for same data
    const sortedPrefs = JSON.stringify(
      preferences,
      Object.keys(preferences).sort()
    );
    const hash = crypto
      .createHash("sha256")
      .update(`${type}:${sortedPrefs}`)
      .digest("hex");
    return hash;
  }

  /**
   * Get cached result
   */
  static async getCached(
    type: "salary_benchmark" | "job_matching" | "cv_preferences",
    preferences: any
  ) {
    const cacheKey = this.generateCacheKey(type, preferences);
    const now = new Date();

    const cached = await this.collection().findOne({
      cacheKey,
      cacheType: type,
      expiresAt: { $gt: now },
    });

    if (cached) {
      // Update last accessed time and hit count
      await this.collection().updateOne(
        { _id: cached._id },
        {
          $set: { lastAccessedAt: now },
          $inc: { hitCount: 1 },
        }
      );

      console.log(
        `✅ Cache HIT for ${type} (key: ${cacheKey.substring(
          0,
          16
        )}..., hits: ${cached.hitCount + 1})`
      );
      return cached.result;
    }

    console.log(
      `❌ Cache MISS for ${type} (key: ${cacheKey.substring(0, 16)}...)`
    );
    return null;
  }

  /**
   * Save result to cache
   */
  static async setCache(
    type: "salary_benchmark" | "job_matching" | "cv_preferences",
    preferences: any,
    result: any,
    ttlHours = 24 // Default 24 hours cache
  ) {
    const cacheKey = this.generateCacheKey(type, preferences);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    // Upsert: update if exists, insert if not
    await this.collection().updateOne(
      { cacheKey, cacheType: type },
      {
        $set: {
          cacheKey,
          cacheType: type,
          preferences,
          result,
          lastAccessedAt: now,
          expiresAt,
        },
        $setOnInsert: {
          createdAt: now,
          hitCount: 0,
        },
      },
      { upsert: true }
    );

    console.log(
      `💾 Cache SAVED for ${type} (key: ${cacheKey.substring(
        0,
        16
      )}..., expires: ${ttlHours}h)`
    );
  }

  /**
   * Clear expired cache (can be run periodically)
   */
  static async clearExpired() {
    const now = new Date();
    const result = await this.collection().deleteMany({
      expiresAt: { $lt: now },
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Cleared ${result.deletedCount} expired cache entries`);
    }

    return result.deletedCount;
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    const stats = await this.collection()
      .aggregate([
        {
          $group: {
            _id: "$cacheType",
            totalEntries: { $sum: 1 },
            totalHits: { $sum: "$hitCount" },
            avgHits: { $avg: "$hitCount" },
          },
        },
      ])
      .toArray();

    return stats;
  }

  /**
   * Invalidate cache for specific type
   */
  static async invalidateByType(
    type: "salary_benchmark" | "job_matching" | "cv_preferences"
  ) {
    const result = await this.collection().deleteMany({ cacheType: type });
    console.log(
      `🗑️ Invalidated ${result.deletedCount} cache entries for ${type}`
    );
    return result.deletedCount;
  }

  /**
   * Clear all cache for a specific user (by userId in preferences)
   */
  static async clearUserCache(userId: string) {
    const result = await this.collection().deleteMany({
      "preferences.userId": userId,
    });
    console.log(
      `🗑️ Cleared ${result.deletedCount} cache entries for user ${userId}`
    );
    return result.deletedCount;
  }
}

export default CacheModel;
