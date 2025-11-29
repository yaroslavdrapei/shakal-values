CREATE TYPE "public"."item_category" AS ENUM('SEASON1', 'CLASSIC', 'HOLIDAY_CHRISTMAS', 'HOLIDAY_HALLOWEEN');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('ANCIENT', 'VINTAGE', 'CHROMA', 'GODLY', 'LEGENDARY', 'RARE', 'UNCOMMON', 'COMMON', 'PET', 'MISC', 'UNIQUE');--> statement-breakpoint
CREATE TYPE "public"."item_source" AS ENUM('SUPREME', 'MM2VALUES');--> statement-breakpoint
CREATE TYPE "public"."item_stability" AS ENUM('RISING', 'OVERPAID_FOR', 'DOING_WELL', 'IMPROVING', 'FLUCTUATING', 'RECEDING', 'STABLE', 'UNDERPAID_FOR', 'DECREASING', 'UNSAFE');--> statement-breakpoint
CREATE TABLE "item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(70) NOT NULL,
	"type" "item_type" NOT NULL,
	"origin" varchar(70) NOT NULL,
	"category" "item_category" NOT NULL,
	"class" "item_type",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"value" varchar(70) NOT NULL,
	"stability" "item_stability" NOT NULL,
	"demand" numeric(10, 2) NOT NULL,
	"rarity" numeric(10, 2) NOT NULL,
	"source" "item_source" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_values" ADD CONSTRAINT "item_values_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE no action ON UPDATE no action;