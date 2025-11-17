# Panduan Meningkatkan Akurasi Embedding

## 1. Gunakan Model Embedding Terbaik

### Update Environment Variable

```bash
# .env atau .env.local
GEMINI_EMBEDDING_MODEL=text-embedding-004  # Model terbaru Gemini (lebih akurat dari gemini-embedding-001)

# Atau gunakan OpenAI (backup)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # Atau text-embedding-3-large untuk akurasi maksimal
```

### Perbandingan Model:

- **text-embedding-004** (Gemini terbaru): Best balance, gratis, 1536 dimensions
- **text-embedding-3-small** (OpenAI): Cepat, murah, 1536 dimensions
- **text-embedding-3-large** (OpenAI): Paling akurat, lebih mahal, bisa sampai 3072 dimensions

---

## 2. Preprocessing Text

Fungsi `preprocessTextForEmbedding()` sudah ditambahkan dan akan:

- Lowercase semua text untuk konsistensi
- Remove extra whitespace
- Truncate text yang terlalu panjang (max ~8000 characters)

### Cara Pakai:

```typescript
// Otomatis diaktifkan secara default
const embedding = await generateGeminiEmbedding("Your text here");

// Jika ingin disable preprocessing
const embedding = await generateGeminiEmbedding("Your text here", {
  preprocess: false,
});
```

---

## 3. Context Enrichment (Metadata)

Tambahkan metadata untuk embedding yang lebih kaya konteks:

```typescript
const embedding = await generateGeminiEmbedding("Job description text", {
  metadata: {
    title: "Senior Software Engineer",
    category: "IT/Software Development",
    tags: ["React", "TypeScript", "Node.js"],
  },
});
```

Ini akan menghasilkan text seperti:

```
Title: Senior Software Engineer
Category: IT/Software Development

Job description text

Tags: React, TypeScript, Node.js
```

---

## 4. Optimasi Vector Search Parameters

### A. Tingkatkan numCandidates

```typescript
// Default sudah ditingkatkan ke k * 20
const results = await KBVectorModel.knnSearch(embedding, 15, {
  numCandidates: 300, // Lebih banyak kandidat = lebih akurat (tapi lebih lambat)
});
```

**Trade-off:**

- `numCandidates = k * 10`: Fast, accuracy OK
- `numCandidates = k * 20`: **Balanced** (default baru)
- `numCandidates = k * 50`: Slow, best accuracy

### B. Filter dengan Minimum Score

```typescript
const results = await KBVectorModel.knnSearch(embedding, 15, {
  minScore: 0.7, // Hanya kembalikan hasil dengan similarity score >= 0.7
});
```

---

## 5. Hybrid Search (Vector + Keyword)

Untuk akurasi maksimal, gunakan hybrid search yang menggabungkan:

- **Vector similarity**: Semantic matching
- **Keyword matching**: Exact/fuzzy text matching

### Setup Text Index (One-time)

Jalankan di MongoDB Atlas:

```javascript
// Di MongoDB Atlas UI atau mongo shell
db.kb_vectors.createIndex(
  {
    text: "text",
    chunkText: "text",
  },
  {
    name: "default",
  }
);
```

### Cara Pakai:

```typescript
const results = await KBVectorModel.hybridSearch(
  embedding,
  ["React", "TypeScript", "software engineer"], // Keywords penting
  15,
  {
    vectorWeight: 0.7, // 70% dari vector similarity
    keywordWeight: 0.3, // 30% dari keyword matching
    minScore: 0.5,
  }
);
```

**Rekomendasi Weight:**

- General use: `vectorWeight: 0.7, keywordWeight: 0.3`
- Exact match penting: `vectorWeight: 0.5, keywordWeight: 0.5`
- Semantic focus: `vectorWeight: 0.8, keywordWeight: 0.2`

---

## 6. Data Quality Best Practices

### A. Chunk Size Optimization

Untuk dokumen panjang, bagi menjadi chunks:

```typescript
// Optimal chunk size: 500-1000 characters
// Dengan overlap: 50-100 characters
const chunks = splitTextIntoChunks(longText, {
  chunkSize: 800,
  overlap: 100,
});

// Generate embedding untuk setiap chunk
for (const chunk of chunks) {
  const embedding = await generateGeminiEmbedding(chunk.text, {
    metadata: {
      title: documentTitle,
      chunkIndex: chunk.index,
      totalChunks: chunks.length,
    },
  });
  // Save to database
}
```

### B. Consistent Data Format

```typescript
// ✅ BAIK: Struktur konsisten
{
  text: "Main content here",
  source: "jobs/senior-engineer.pdf",
  metadata: {
    title: "Senior Engineer Position",
    category: "IT",
    location: "Jakarta",
    salary: "15000000"
  }
}

// ❌ BURUK: Data tidak konsisten
{
  content: "Some content",  // Gunakan 'text' bukan 'content'
  file: "random.txt",       // Gunakan 'source' bukan 'file'
  // Missing metadata
}
```

---

## 7. Monitoring & Evaluation

### A. Log Similarity Scores

```typescript
const results = await KBVectorModel.knnSearch(embedding, 15);

// Analyze scores
console.log("Top 3 results:");
results.slice(0, 3).forEach((r, i) => {
  console.log(
    `${i + 1}. Score: ${r.score?.toFixed(4)} - ${r.text?.substring(0, 50)}...`
  );
});

// Check jika scores terlalu rendah
const avgScore =
  results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
if (avgScore < 0.6) {
  console.warn("Low average similarity score. Consider:");
  console.warn("- Improve data quality");
  console.warn("- Add more training data");
  console.warn("- Use hybrid search");
}
```

### B. A/B Testing

Test berbagai konfigurasi:

```typescript
// Test 1: Vector only
const results1 = await KBVectorModel.knnSearch(embedding, 15);

// Test 2: Hybrid search
const results2 = await KBVectorModel.hybridSearch(embedding, keywords, 15);

// Compare results dan pilih yang lebih relevan
```

---

## 8. Advanced: Re-ranking

Untuk hasil terbaik, tambahkan re-ranking stage:

```typescript
async function rerankResults(query: string, results: any[]) {
  // Use more powerful model untuk re-rank top results
  const prompt = `
Given this search query: "${query}"

Rank these ${results.length} search results from most to least relevant:
${results.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}

Return only the ranking as numbers, e.g: 3,1,5,2,4
`;

  const ranking = await generateGeminiContent(prompt);
  // Parse ranking dan reorder results
  // ...
}
```

---

## Checklist Implementasi

- [x] Update GEMINI_EMBEDDING_MODEL ke `text-embedding-004`
- [x] Enable preprocessing (sudah default aktif)
- [x] Gunakan metadata enrichment untuk dokumen penting
- [x] Tingkatkan numCandidates di vector search (default k\*20)
- [ ] Setup text index di MongoDB untuk hybrid search
- [ ] Test hybrid search vs vector-only search
- [ ] Monitor similarity scores secara regular
- [ ] Optimize chunk size untuk dokumen panjang
- [ ] Implement A/B testing untuk berbagai konfigurasi

---

## Troubleshooting

### Masalah: Similarity scores terlalu rendah (< 0.5)

**Solusi:**

1. Check kualitas data di database
2. Pastikan menggunakan model terbaru
3. Enable preprocessing dan metadata
4. Gunakan hybrid search
5. Re-generate embeddings dengan model baru

### Masalah: Search terlalu lambat

**Solusi:**

1. Kurangi numCandidates (tapi akurasi turun)
2. Add index di MongoDB
3. Reduce k (jumlah hasil)
4. Cache frequent queries

### Masalah: Hasil tidak relevan

**Solusi:**

1. Gunakan hybrid search dengan keyword matching
2. Add minScore filter (e.g., 0.6)
3. Improve query preprocessing
4. Add more context via metadata

---

## Resources

- [Gemini Embeddings API](https://ai.google.dev/gemini-api/docs/embeddings)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
