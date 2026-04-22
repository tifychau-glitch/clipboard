CREATE TABLE "daemon_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_key" text NOT NULL,
	"device_name" text NOT NULL,
	"os" text NOT NULL,
	"available_clis" jsonb NOT NULL,
	"version" text,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "daemon_devices_device_key_unique_idx" ON "daemon_devices" USING btree ("device_key");