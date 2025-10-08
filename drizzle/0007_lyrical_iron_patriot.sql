ALTER TABLE "client" ADD COLUMN "rut" text;--> statement-breakpoint
UPDATE "client" SET "rut" = 'TEMP-' || "id" WHERE "rut" IS NULL;--> statement-breakpoint
ALTER TABLE "client" ALTER COLUMN "rut" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_rut_unique" UNIQUE("rut");