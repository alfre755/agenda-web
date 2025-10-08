-- Drop foreign key constraints temporarily
ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "appointment_client_id_client_id_fk";--> statement-breakpoint
-- Convert client.id from text to bigint with identity
ALTER TABLE "client" ALTER COLUMN "id" SET DATA TYPE bigint USING id::bigint;--> statement-breakpoint
ALTER TABLE "client" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "client_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
-- Convert calendar.id from text to bigint with identity
ALTER TABLE "calendar" ALTER COLUMN "id" SET DATA TYPE bigint USING id::bigint;--> statement-breakpoint
ALTER TABLE "calendar" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "calendar_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
-- Convert appointment.id and client_id from text to bigint with identity
ALTER TABLE "appointment" ALTER COLUMN "id" SET DATA TYPE bigint USING id::bigint;--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "appointment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "client_id" SET DATA TYPE bigint USING client_id::bigint;--> statement-breakpoint
-- Recreate foreign key constraint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "client"("id");