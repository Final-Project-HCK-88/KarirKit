/**
 * Script untuk setup text index di MongoDB Atlas
 * Diperlukan untuk hybrid search (vector + keyword)
 */

import { MongoClient } from "mongodb";

async function setupTextIndex() {
  const uri = process.env.MONGODB_URI || "";

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connected!");

    const database = client.db("KarirKitDB");
    const collection = database.collection("kb_vectors");

    console.log("Creating text index on 'text' and 'chunkText' fields...");

    // Create text index
    const indexName = await collection.createIndex(
      {
        text: "text",
        chunkText: "text",
      },
      {
        name: "text_search_index",
        default_language: "english",
        weights: {
          text: 10, // Higher weight untuk field 'text'
          chunkText: 5, // Lower weight untuk field 'chunkText'
        },
      }
    );

    console.log(`✅ Text index created successfully: ${indexName}`);

    // List all indexes
    console.log("\nCurrent indexes on kb_vectors collection:");
    const indexes = await collection.indexes();
    indexes.forEach((idx, i) => {
      console.log(`${i + 1}. ${idx.name}`);
      console.log(`   Keys:`, idx.key);
      if (idx.weights) console.log(`   Weights:`, idx.weights);
    });

    console.log("\n✅ Setup completed! You can now use hybrid search.");
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up text index:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      console.log("\nℹ️  Text index already exists. No action needed.");
      console.log("You can use hybrid search now.");
      await client.close();
      process.exit(0);
    }

    await client.close();
    process.exit(1);
  }
}

// Run the setup
setupTextIndex();
