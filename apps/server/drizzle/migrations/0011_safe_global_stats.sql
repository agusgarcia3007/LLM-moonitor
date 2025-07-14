CREATE TABLE IF NOT EXISTS "global_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_events" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp NOT NULL
);

-- Inicializar la tabla con el conteo actual
INSERT INTO "global_stats" ("total_events", "updated_at") 
SELECT COUNT(*), NOW() FROM "llm_event"
ON CONFLICT DO NOTHING; 