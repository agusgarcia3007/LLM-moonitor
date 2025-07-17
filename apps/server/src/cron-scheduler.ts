import { refreshPriceCache } from "@/lib/cost-calculator";
import { updateAllPrices } from "@/services/models-pricing/orchestrator";
import * as cron from "node-cron";

export function initCrons() {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🔄 Starting daily pricing update at 00:00 AM (ART)...");
      try {
        await updateAllPrices();
        await refreshPriceCache();
        console.log("✅ Daily pricing update completed successfully");
      } catch (error) {
        console.error("❌ Error during daily pricing update:", error);
      }
    },
    {
      timezone: "America/Argentina/Buenos_Aires",
    }
  );

  console.log("⏰ Daily pricing update cron job scheduled for 00:00 AM");
}
