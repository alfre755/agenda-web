CREATE TABLE "organization_config" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"phone_number_id" text,
	"wsp_token" text,
	"api_url_list" text,
	"api_key_agenda" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_config" ADD CONSTRAINT "organization_config_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;