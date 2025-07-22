import { ProviderConfig } from "@/types/providers";

export const AI_PROVIDERS: ProviderConfig = {
  openai: {
    name: "openai",
    displayName: "OpenAI",
    pricingUrl: "https://platform.openai.com/docs/pricing",
  },
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic",
    pricingUrl:
      "https://docs.anthropic.com/en/docs/about-claude/models/overview#model-pricing",
  },
  google: {
    name: "google",
    displayName: "Google",
    pricingUrl: "https://ai.google.dev/gemini-api/docs/pricing",
  },
  cohere: {
    name: "cohere",
    displayName: "Cohere",
    pricingUrl: "https://cohere.com/pricing",
  },
  deepseek: {
    name: "deepseek",
    displayName: "DeepSeek",
    pricingUrl: "https://api-docs.deepseek.com/quick_start/pricing",
  },
};
