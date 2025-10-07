ALTER TABLE "client" ADD COLUMN "rut" text NOT NULL;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_rut_unique" UNIQUE("rut");