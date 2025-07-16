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
🎯 MISSION: Extract 100% of ALL AI models from this ${providerName} pricing page. ZERO TOLERANCE for missing models.

📋 MANDATORY EXTRACTION AREAS (scan ALL of these):
1. "Latest models" section - Main pricing table
2. "Fine-tuning" section - Training models  
3. "Audio tokens" table - Audio/speech models
4. "Image tokens" table - Vision models
5. "Transcription and speech generation" - Audio processing
6. "Image generation" - DALL-E and image models
7. "Embeddings" section - Embedding models
8. "Moderation" section - Content moderation
9. "Other models" section - Legacy/additional models
10. ANY other section containing model names and prices

🔍 TABLE PROCESSING RULES:
- Each table row = one potential model
- Model names appear in FIRST column (may have multiple names per row)
- When you see "modelname1<br>modelname2", extract BOTH as separate models
- Example: "gpt-4o<br>gpt-4o-2024-08-06" = extract "gpt-4o" AND "gpt-4o-2024-08-06"
- Prices in subsequent columns (Input/Output/Training)

💰 PRICE CONVERSION (CRITICAL):
- ALL prices shown as "per /1M tokens" or "per 1M tokens"
- Convert: $X.XX per 1M = X.XX ÷ 1,000,000
- Examples:
  * $0.15 per 1M → 0.00000015
  * $0.60 per 1M → 0.0000006  
  * $2.50 per 1M → 0.0000025
  * $15.00 per 1M → 0.000015

🎯 REQUIRED JSON OUTPUT:
{
  "prices": [
    {
      "modelId": "exact-model-name-from-table",
      "modelName": "Human readable name",
      "provider": "${providerName}",
      "inputPrice": 0.00000015,
      "outputPrice": 0.0000006,
      "trainingPrice": null,
      "unit": "per_token",
      "trainingUnit": "per_token", 
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}

⚠️ CRITICAL FIELD RULES:
- "unit" and "trainingUnit" NEVER null - use "per_token" for text, "per_image" for images, "per_second" for audio
- For free models: set prices to 0
- For training-only models: inputPrice=0, outputPrice=0, trainingPrice=value
- For missing prices: use null (not 0)

🔎 EXPECTED MODEL EXAMPLES (extract if present):
OpenAI: gpt-4o, gpt-4o-mini, gpt-4o-2024-08-06, gpt-4o-mini-2024-07-18, o1, o1-mini, o3, o4-mini, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, text-embedding-3-small, dall-e-3, whisper-1, chatgpt-4o-latest...

📊 VALIDATION CHECKLIST - YOU MUST VERIFY:
✓ Scanned ALL sections mentioned above
✓ Processed EVERY table row containing models
✓ Extracted BOTH generic AND versioned names (gpt-4o AND gpt-4o-2024-08-06)
✓ Applied price conversion correctly 
✓ No null values in required fields

🚨 ABSOLUTE REQUIREMENTS:
- EXTRACT EVERY SINGLE MODEL mentioned anywhere in the content
- DO NOT skip models because they seem similar or redundant  
- DO NOT limit extraction to "popular" models only
- DO NOT stop after finding 20-30 models - keep scanning until the END
- If you find fewer than 40 models for OpenAI, you FAILED - try again

CONTENT TO SCAN:
---
${scrapeResponse.markdown}
---

NOW EXECUTE: Scan every section, every table, every model. Return JSON with ALL models found. NO EXCEPTIONS.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: extractionPrompt }],
    response_format: { type: "json_object" },
    temperature: 0, // Máxima precisión
  });

  const rawJson = response.choices[0].message.content;
  if (!rawJson) {
    throw new Error("OpenAI API response did not contain content.");
  }

  const resultObject = JSON.parse(rawJson);
  const parsedPrices: ModelPrice[] = resultObject.prices || [];

  if (!Array.isArray(parsedPrices)) {
    throw new Error(
      'The "prices" key in the OpenAI response was not an array.'
    );
  }

  // Validación automática
  if (providerName === "openai" && parsedPrices.length < 40) {
    console.warn(
      `⚠️ WARNING: Only found ${parsedPrices.length} models for OpenAI. Expected 40+. Possible incomplete extraction.`
    );
  }

  console.log(
    `✅ Extracted prices for ${providerName}: ${parsedPrices.length} models found.`
  );
  return parsedPrices;
}
