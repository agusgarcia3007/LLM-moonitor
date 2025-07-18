ALTER TABLE "llm_event" DROP CONSTRAINT "llm_event_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "llm_event" ADD CONSTRAINT "llm_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;