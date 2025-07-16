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
You are a data extraction specialist. Your task is to extract ALL AI model pricing information from the provided ${providerName} pricing page content.

CRITICAL RULES:
1. ONLY extract models that are EXPLICITLY mentioned in the provided content
2. DO NOT invent, guess, or hallucinate any model names or prices
3. Extract EVERY model you find - scan the ENTIRE document thoroughly
4. Include both generic names (gpt-4o-mini) AND specific versions (gpt-4o-mini-2024-07-18) if both appear
5. Look in ALL sections: Latest models, Legacy models, Fine-tuning, Audio, Images, Embeddings, Moderation, etc.

REQUIRED JSON FORMAT:
{
  "prices": [
    {
      "modelId": "exact-model-name-from-content",
      "modelName": "Human readable display name",
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

PRICE CONVERSION RULES (CRITICAL):
- Convert ALL prices to per-token basis
- "$0.15 per 1M tokens" = 0.15 ÷ 1,000,000 = 0.00000015
- "$0.60 per 1M tokens" = 0.60 ÷ 1,000,000 = 0.0000006 
- "$3.00 per 1M tokens" = 3.00 ÷ 1,000,000 = 0.000003
- "$0.30 per 1K tokens" = 0.30 ÷ 1,000 = 0.0003

FIELD REQUIREMENTS:
- "modelId": Use EXACT model name from pricing tables
- "unit": MUST be "per_token" (for text), "per_image" (for images), or "per_second" (for audio) - NEVER null
- "trainingUnit": MUST be "per_token" or appropriate unit - NEVER null
- For models with only training costs: set inputPrice=0, outputPrice=0, unit="per_token"
- For free models: set all prices to 0

EXAMPLES OF REAL MODEL NAMES TO EXTRACT (if present):
OpenAI: gpt-4o, gpt-4o-mini, gpt-4o-2024-08-06, gpt-4o-mini-2024-07-18, text-embedding-3-small, text-embedding-3-large, whisper-1, dall-e-3, dall-e-2, gpt-3.5-turbo, gpt-3.5-turbo-0125, etc.

Anthropic: claude-3-5-sonnet-20241022, claude-3-haiku-20240307, claude-3-opus-20240229, claude-3-sonnet-20240229, etc.

Google: gemini-1.5-pro, gemini-1.5-flash, gemini-1.0-pro, text-embedding-004, etc.

VALIDATION CHECKLIST:
✓ All model names come directly from the content
✓ All prices are mathematically converted correctly  
✓ No null values in required fields (unit, trainingUnit)
✓ Scanned entire document for all models
✓ Included both generic and versioned model names where available

NOW EXTRACT FROM THIS CONTENT:
---
${scrapeResponse.markdown}
---

Extract EVERY model mentioned above. Do not skip any. Include both generic and versioned model names where available for example:
- gpt-4o
- gpt-4o-2024-08-06
- gpt-4o-mini
- gpt-4o-mini-2024-07-18
- claude-3-5-sonnet-20241022
- claude-3-haiku-20240307
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
