export interface Provider {
  name: string;
  displayName: string;
  pricingUrl: string;
}

export interface ProviderConfig {
  [providerName: string]: Provider;
}

export type ProviderName =
  | "openai"
  | "anthropic"
  | "google"
  | "cohere"
  | "deepseek";

export interface UsageTokens {
  prompt_tokens?: number;
  completion_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  promptTokenCount?: number;
  candidatesTokenCount?: number;
}
