import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

export async function generateOpenAIContent(
  prompt: string,
  model: string = "gpt-4o-mini",
  maxTokens: number = 4000
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  try {
    console.log(`🤖 Calling OpenAI ${model}...`);

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Log token usage
    if (completion.usage) {
      console.log("📊 OpenAI Token Usage:");
      console.log("  - Prompt tokens:", completion.usage.prompt_tokens);
      console.log("  - Completion tokens:", completion.usage.completion_tokens);
      console.log("  - Total tokens:", completion.usage.total_tokens);
    }

    console.log("✅ OpenAI response received");
    return content;
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    throw error;
  }
}

export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  try {
    console.log("🔢 Generating OpenAI embedding...");

    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      input: text,
    });

    console.log("✅ OpenAI embedding generated");
    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ OpenAI embedding error:", error);
    throw error;
  }
}
