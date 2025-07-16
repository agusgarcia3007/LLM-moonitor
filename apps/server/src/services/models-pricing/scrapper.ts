import { ModelPrice } from "@/db/schema";
import { firecrawl } from "@/lib/firecrawl";
import { openai } from "@/lib/openai";

export async function fetchPricesFromProvider(
  url: string,
  providerName: string
): Promise<ModelPrice[]> {
  console.log(`🚀 Starting process for ${providerName} from ${url}`);

  const scrapeResponse = await firecrawl.scrapeUrl(url, {
    formats: ["markdown"],
  });

  if (!scrapeResponse.success) {
    throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
  }

  const extractionPrompt = `
    You are extracting ALL pricing information from a comprehensive pricing page. You must find and extract EVERY SINGLE MODEL mentioned on the page, regardless of which section it appears in.

    CRITICAL REQUIREMENTS:
    1. Extract models from ALL sections: Latest models, Fine-tuning, Audio tokens, Image tokens, Embeddings, Moderation, Other models, Transcription, Speech generation, etc.
    2. Include ALL model variations and versions (e.g., both "gpt-4o" and "gpt-4o-2024-08-06")
    3. Do NOT skip any models - we need complete coverage for user pricing calculations
    4. Look through the ENTIRE document, not just the first table
    5. NEVER return duplicate modelId values - each modelId must be unique in the response
    6. If the same model appears in multiple sections, include it only ONCE with complete pricing info

    Return a single JSON object with one key: "prices". The value must be an array containing ALL models found.

    Each object in the "prices" array must follow this exact structure:
    {
      "modelId": "exact-technical-model-name-as-used-in-api",
      "modelName": "Human readable model name",
      "provider": "${providerName}",
      "inputPrice": 0.00000,
      "outputPrice": 0.00000,
      "trainingPrice": 0.00000 (or null if not applicable),
      "unit": "per_token",
      "trainingUnit": "per_token" (or "per_hour" if applicable, or null),
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }

    🚨 CRITICAL PRICE CONVERSION RULES 🚨
    ALWAYS convert prices to PER-TOKEN basis, NOT per million tokens:
    
    Examples of CORRECT conversions:
    - "$0.15 per 1M input tokens" → inputPrice: 0.00000015 (divide by 1,000,000)
    - "$0.60 per 1M output tokens" → outputPrice: 0.0000006 (divide by 1,000,000)
    - "$3.00 per 1M training tokens" → trainingPrice: 0.000003 (divide by 1,000,000)
    - "$0.30 per 1K tokens" → price: 0.0003 (divide by 1,000)
    
    MATHEMATICAL CHECK: Final prices should be in the range 0.0000001 to 0.001 for most models.
    If any price is above 0.001, you probably forgot to divide by the appropriate factor.

    CRITICAL - MODEL ID RULES:
    - "modelId" MUST be the exact technical model name as used in API calls (e.g., "gpt-4o-mini", "claude-3-haiku-20240307", "text-embedding-3-small")
    - Do NOT use descriptive names like "Embed 4" or "GPT 4 Turbo" for modelId
    - Use the actual model identifier shown in the pricing tables (often in the left column)
    - Examples: "gpt-4o-mini-tts", "whisper-1", "dall-e-3", "text-embedding-ada-002"
    - If multiple versions exist, use the full version name (e.g., "gpt-4o-2024-08-06")

    PRICING CONVERSION RULES:
    - Convert ALL prices to cost per single token
    - If prices are shown "per 1M tokens" (like $0.15 per 1M), you MUST divide by 1,000,000 (result: 0.00000015)
    - If prices are shown "per 1K tokens" (like $0.15 per 1K), you MUST divide by 1,000 (result: 0.00015)
    - Example: "$0.15 per 1M tokens" becomes 0.00000015, NOT 0.00015
    - Example: "$0.60 per 1M tokens" becomes 0.0000006, NOT 0.0006
    - The "unit" field must ALWAYS be exactly "per_token" - never null or any other value
    - If a model has different pricing for different use cases (text vs audio vs image), create separate entries
    - For image generation models, convert per-image pricing to token equivalent if possible, or set both input/output to the same value
    - For free models (like moderation), set prices to 0.0

    SPECIAL INSTRUCTIONS:
    - For models with only training costs, put the cost in trainingPrice and set input/output to 0
    - For models with cached input pricing, use the regular input price (not cached)
    - For models shown in multiple sections, include ALL variants
    - Extract embedding models, moderation models, transcription models - EVERYTHING
    - Model names like "gpt-4o-2024-08-06" should use the full name as modelId

    MANDATORY: 
    - Scan the ENTIRE document thoroughly. Do not stop after finding a few models. We need COMPLETE coverage of all available models for accurate user billing.
    - Ensure each modelId appears only ONCE in your response. No duplicates allowed.
    - If you find the same model in multiple sections, consolidate it into a single entry with all relevant pricing.

    Markdown content to parse:
    ---
    ${scrapeResponse.markdown}
    ---
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: extractionPrompt }],
    response_format: { type: "json_object" },
  });

  const rawJson = response.choices[0].message.content;
  if (!rawJson) {
    throw new Error("OpenAI API response did not contain content.");
  }

  const resultObject = JSON.parse(rawJson);
  console.log(
    `📊 AI output for ${providerName}:`,
    JSON.stringify(resultObject, null, 2)
  );
  const parsedPrices: ModelPrice[] = resultObject.prices || [];

  if (!Array.isArray(parsedPrices)) {
    throw new Error(
      'The "prices" key in the OpenAI response was not an array.'
    );
  }

  console.log(
    `✅ Extracted prices for ${providerName}: ${parsedPrices.length} models found.`
  );
  return parsedPrices;
}
