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
    Based on the following markdown from a pricing page, extract the pricing information for each AI model.
    Return a single JSON object with one key: "prices". The value of "prices" must be an array of objects.

    Each object in the "prices" array must follow this exact structure:
    {
      "modelId": "the_api_ready_model_identifier",
      "modelName": "The human-readable model name",
      "provider": "${providerName}",
      "inputPrice": 0.00000,
      "outputPrice": 0.00000,
      "trainingPrice": 0.00000 (or null if not applicable),
      "unit": "per_token" (must always be exactly the string "per_token" for all models. Never use any other value. Never return null or undefined. If the price is per million tokens, divide by 1,000,000 and return the price per token.),
      "trainingUnit": "per_token" (or "per_hour" if applicable, or null),
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }

    IMPORTANT:
    - The "unit" field must always be exactly "per_token". If the price is per million tokens (e.g., "$5.00 / 1M tokens"), set "unit": "per_token" and divide the price by 1,000,000. Never return null, undefined, or any other value for the "unit" field.
    - If the model does not have a price per token, omit it from the array (do not include objects with null or missing fields).
    - All prices must be calculated PER SINGLE TOKEN. For example, $5.00 / 1M tokens becomes 0.000005.

    Markdown content to parse:
    ---
    ${scrapeResponse.markdown}
    ---
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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
