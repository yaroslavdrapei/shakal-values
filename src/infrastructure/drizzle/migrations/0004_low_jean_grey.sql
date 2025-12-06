CREATE TYPE "public"."feature_usage" AS ENUM('ask', 'inv', 'trade');--> statement-breakpoint
CREATE TYPE "public"."metric_source" AS ENUM('telegram', 'webapp');--> statement-breakpoint
CREATE TABLE "metrics_feature_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature" "feature_usage" NOT NULL,
	"source" "metric_source" NOT NULL,
	"chat_id" bigint,
	"user_id" uuid,
	"success" boolean NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
