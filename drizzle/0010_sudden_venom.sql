CREATE TYPE "public"."conversation_status" AS ENUM('pendiente', 'confirmada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."wsp_message_status" AS ENUM('enviado', 'enviado_automatico', 'recibido');--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" text NOT NULL,
	"organization_id" text NOT NULL,
	"appointment_id" bigint,
	"status" "conversation_status" DEFAULT 'pendiente' NOT NULL,
	"phone_number" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "conversation_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "wsp_message" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wsp_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" text NOT NULL,
	"conversation_id" bigint NOT NULL,
	"wsp_message_id" text,
	"sender" text,
	"content" text,
	"status" "wsp_message_status" DEFAULT 'enviado' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "wsp_message_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wsp_message" ADD CONSTRAINT "wsp_message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE no action ON UPDATE no action;