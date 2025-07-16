import { ModelPrice, model_prices } from "@/db/schema";
import { fetchPricesFromProvider } from "./scrapper";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { AI_PROVIDERS, Provider } from "@llmonitor/ai-providers";

export async function updateAllPrices() {
  const providersToScrape = Object.entries(AI_PROVIDERS).map(
    ([key, provider]: [string, Provider]) => ({
      name: key,
      url: provider.pricingUrl,
    })
  );

  console.log(
    `🚀 Starting parallel fetching for ${providersToScrape.length} providers...`
  );

  const pricePromises = providersToScrape.map((provider) =>
    fetchPricesFromProvider(provider.url, provider.name)
  );

  const results = await Promise.allSettled(pricePromises);

  let allPrices: ModelPrice[] = [];

  results.forEach((result, index) => {
    const providerName = providersToScrape[index].name;
    if (result.status === "fulfilled") {
      console.log(`✅ Successfully fetched prices for ${providerName}.`);
      allPrices = allPrices.concat(result.value);
    } else {
      console.error(`❌ Error processing ${providerName}:`, result.reason);
    }
  });

  if (allPrices.length === 0) {
    console.log(
      "No prices were fetched successfully. Aborting database update."
    );
    return;
  }

  console.log(
    `💾 Saving or updating ${allPrices.length} model prices in the database...`
  );

  const priceValues = allPrices.map((price) => ({
    modelId: price.modelId,
    modelName: price.modelName,
    provider: price.provider,
    inputPrice: price.inputPrice,
    outputPrice: price.outputPrice,
    trainingPrice: price.trainingPrice,
    unit: price.unit,
    trainingUnit: price.trainingUnit,
    updatedAt: new Date(),
  }));

  await db
    .insert(model_prices)
    .values(priceValues)
    .onConflictDoUpdate({
      target: model_prices.modelId,
      set: {
        modelName: sql`excluded.model_name`,
        inputPrice: sql`excluded.input_price`,
        outputPrice: sql`excluded.output_price`,
        trainingPrice: sql`excluded.training_price`,
        unit: sql`excluded.unit`,
        trainingUnit: sql`excluded.training_unit`,
        updatedAt: new Date(),
      },
    });

  console.log("🏁 Price update process completed successfully.");
}
