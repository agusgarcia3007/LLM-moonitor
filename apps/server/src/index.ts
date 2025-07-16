import { auth } from "@/lib/auth";
import { CORS_OPTIONS } from "@/lib/constants";
import { sessionMiddleware } from "@/middleware/auth";
import { HonoApp } from "@/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { ROUTES } from "./routes";
import { refreshPriceCache } from "@/lib/cost-calculator";
import { updateAllPrices } from "@/services/models-pricing/orchestrator";
import * as cron from "node-cron";

(async () => {
  await refreshPriceCache();
})();

const app = new Hono<HonoApp>()
  .use(cors(CORS_OPTIONS))
  .use(logger())
  .use(prettyJSON())
  .use(sessionMiddleware);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

ROUTES.forEach((route) => {
  app.route(route.path, route.handler);
});

app.onError((err, c) => {
  console.error(err);
  return c.text("Internal Server Error", 500);
});

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

const port = parseInt(Bun.env.PORT || "4444", 10);

export default {
  fetch: app.fetch,
  port,
};
