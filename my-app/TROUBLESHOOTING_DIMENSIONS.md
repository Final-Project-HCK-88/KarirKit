# Troubleshooting Guide - Vector Dimensions Error

## Problem: Dimension Mismatch Error

If you encounter this error:

```
MongoServerError: vector field is indexed with 1536 dimensions but queried with [different number]
```

## Root Cause

Your MongoDB Atlas vector search index is configured with **1536 dimensions**, but the embedding model is returning a different number of dimensions.

## Solution

### 1. **Check Your Environment Variables**

Make sure your `.env.local` or production environment has:

```env
GEMINI_EMBEDDING_MODEL=models/text-embedding-004
```

**Important:** Use `models/text-embedding-004` (with the `models/` prefix), NOT just `text-embedding-004`.

### 2. **Verify MongoDB Atlas Vector Index**

In MongoDB Atlas:

1. Go to your cluster → Database → Collections
2. Find your `kb_vectors` collection
3. Go to "Search Indexes" tab
4. Verify your vector index has these settings:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

### 3. **Model Dimension Reference**

| Model                             | Default Dimensions | Configurable?     |
| --------------------------------- | ------------------ | ----------------- |
| `models/text-embedding-004`       | 768                | ✅ Yes (256-1536) |
| `text-embedding-ada-002` (OpenAI) | 1536               | ❌ No             |
| `text-embedding-3-small` (OpenAI) | 1536               | ✅ Yes            |

### 4. **How the Code Handles This**

The `generateGeminiEmbedding()` function:

1. ✅ Requests 1536 dimensions from Google AI API
2. ✅ Validates the response dimension count
3. ✅ Falls back to OpenAI if Google AI fails or returns wrong dimensions
4. ✅ Logs dimension information for debugging

### 5. **Test Your Setup**

Run this curl command to test Google AI embeddings:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "models/text-embedding-004",
    "content": {
      "parts": [{"text": "test"}]
    },
    "outputDimensionality": 1536
  }'
```

Check the response - `embedding.values` array length should be **1536**.

### 6. **If Problem Persists**

**Option A: Use OpenAI Instead**

Set these environment variables:

```env
OPENAI_API_KEY=your-openai-key
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
```

The code will automatically fall back to OpenAI when Google AI fails.

**Option B: Recreate MongoDB Vector Index**

If you want to use a different dimension size:

1. Delete the existing vector index in MongoDB Atlas
2. Create a new one with the dimension size your model produces
3. Re-generate all embeddings in your database

### 7. **Monitoring**

Check your application logs for these messages:

- `"Gemini embedding generated: X dimensions"` - Should be 1536
- `"Falling back to OpenAI embeddings..."` - Indicates Gemini failed
- `"OpenAI embedding generated: X dimensions"` - Should be 1536

## Prevention

✅ **Always verify dimensions match** between:

1. Your embedding model configuration
2. Your MongoDB vector index
3. Your existing data (if any)

✅ **Use the `.env.example` file** as a template

✅ **Keep `GEMINI_EMBEDDING_MODEL=models/text-embedding-004`** unless you have a specific reason to change it

## Need Help?

1. Check the logs in your terminal/console
2. Verify your API keys are valid
3. Ensure your MongoDB connection is working
4. Test the embedding API with the curl command above
