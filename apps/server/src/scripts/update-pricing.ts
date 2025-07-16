import { updateAllPrices } from "@/services/models-pricing/orchestrator";

(async () => {
  console.log("🚀 [CRON JOB] Starting the scheduled price update job...");
  const start = Date.now();

  try {
    await updateAllPrices();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(
      `✅ [CRON JOB] Scheduled price update job finished successfully. Took ${elapsed} seconds.`
    );
    process.exit(0);
  } catch (error) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(
      `❌ [CRON JOB] The scheduled price update job failed after ${elapsed} seconds:`,
      error
    );
    process.exit(1);
  }
})();
