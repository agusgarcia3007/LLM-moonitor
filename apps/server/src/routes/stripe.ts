import { Hono } from "hono";
import { HonoApp } from "@/types";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const stripeRouter = new Hono<HonoApp>().post("/portal", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (!user.stripeCustomerId) {
    return c.json({ error: "No Stripe customer found" }, 400);
  }

  const { returnUrl } = await c.req.json();

  try {
    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${c.req.header("origin")}/dashboard`,
    });

    return c.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return c.json({ error: "Failed to create portal session" }, 500);
  }
});
