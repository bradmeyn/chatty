CREATE TYPE "public"."chat_role" AS ENUM('USER', 'ASSISTANT', 'SYSTEM');
--> statement-breakpoint
CREATE TABLE "chat" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_by" text,
  "title" varchar(200),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_message" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_id" uuid NOT NULL,
  "role" "chat_role" DEFAULT 'USER' NOT NULL,
  "content" text NOT NULL,
  "created_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "chat_created_by_idx" ON "chat" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX "chat_message_chat_idx" ON "chat_message" USING btree ("chat_id");
