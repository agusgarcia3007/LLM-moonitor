import { db } from "@/db";
import { model_prices } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// --- CACHE EN MEMORIA ---
type PriceCache = Record<string, { inputPrice: number; outputPrice: number }>;
let priceCache: PriceCache = {};

export async function refreshPriceCache() {
  const all = await db.select().from(model_prices);
  const cache: PriceCache = {};
  for (const row of all) {
    const key = `${row.provider}::${row.modelId}`;
    cache[key] = {
      inputPrice: row.inputPrice || 0,
      outputPrice: row.outputPrice || 0,
    };
  }
  priceCache = cache;
  console.log(
    `[CACHE] Model price cache refreshed (${Object.keys(cache).length} models)`
  );
}

export function calculateCostFromCache(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const key = `${provider}::${model}`;
  const price = priceCache[key];
  console.log(`[CACHE] Price for ${key}: ${price}`);
  if (!price) return 0;
  const inputCost = (promptTokens || 0) * price.inputPrice;
  const outputCost = (completionTokens || 0) * price.outputPrice;
  return inputCost + outputCost;
}

export async function calculateCostFromDb(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): Promise<number> {
  const [price] = await db
    .select()
    .from(model_prices)
    .where(
      and(eq(model_prices.provider, provider), eq(model_prices.modelId, model))
    )
    .limit(1);

  if (!price) return 0;

  const inputCost = (promptTokens || 0) * (price.inputPrice || 0);
  const outputCost = (completionTokens || 0) * (price.outputPrice || 0);

  return inputCost + outputCost;
}
