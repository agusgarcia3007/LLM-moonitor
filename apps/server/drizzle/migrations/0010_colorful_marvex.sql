CREATE TABLE IF NOT EXISTS "global_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_events" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
-- Commented out to avoid constraint violations on existing data:
-- ALTER TABLE "llm_event" ALTER COLUMN "prompt" SET NOT NULL;--> statement-breakpoint
-- ALTER TABLE "llm_event" ALTER COLUMN "completion" SET NOT NULL;--> statement-breakpoint
-- Commented out to avoid data loss. These columns will be migrated later:
-- ALTER TABLE "llm_event" DROP COLUMN "input";--> statement-breakpoint
-- ALTER TABLE "llm_event" DROP COLUMN "input_tokens";--> statement-breakpoint
-- ALTER TABLE "llm_event" DROP COLUMN "embedding_dimensions";