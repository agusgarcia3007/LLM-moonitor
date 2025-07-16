CREATE TABLE "model_prices" (
	"model_id" text PRIMARY KEY NOT NULL,
	"model_name" text NOT NULL,
	"provider" text NOT NULL,
	"input_price" real,
	"output_price" real,
	"training_price" real,
	"unit" text DEFAULT 'per_token' NOT NULL,
	"training_unit" text,
	"updated_at" timestamp NOT NULL
);
