ALTER TABLE "calendar_config" ADD COLUMN "start_day" text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_config" ADD COLUMN "end_day" text DEFAULT '6' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_config" ADD COLUMN "start_hour_calendar" text DEFAULT '08:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_config" ADD COLUMN "end_hour_calendar" text DEFAULT '18:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_config" ADD COLUMN "slot_duration_calendar" text DEFAULT '5' NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_config" DROP COLUMN "frequency";--> statement-breakpoint
ALTER TABLE "calendar_config" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "calendar_config" DROP COLUMN "end_date";