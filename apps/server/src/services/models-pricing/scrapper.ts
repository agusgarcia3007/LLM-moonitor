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
Extract ALL AI models with pricing from this ${providerName} pricing page.

Look through the ENTIRE document and find EVERY model listed, including:
- Text generation models
- Image models  
- Audio/speech models
- Embedding models
- Moderation models
- Fine-tuning models
- ALL versions and variations

Return JSON: {"prices": [array of all models]}

Each model object:
{
  "modelId": "exact-model-name-from-table",
  "modelName": "Display name",
  "provider": "${providerName}",
  "inputPrice": 0.00000015,
  "outputPrice": 0.0000006,
  "trainingPrice": null,
  "unit": "per_token", 
  "trainingUnit": null,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}

PRICE CONVERSION:
- "$0.15 per 1M tokens" = 0.15 ÷ 1,000,000 = 0.00000015
- "$0.60 per 1M tokens" = 0.60 ÷ 1,000,000 = 0.0000006

Extract EVERY model you see. Include both generic names (gpt-4o-mini) AND specific versions (gpt-4o-mini-2024-07-18) if listed separately.
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
