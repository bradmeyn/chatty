import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";

export const chatRole = pgEnum("chat_role", ["USER", "ASSISTANT", "SYSTEM"]);

export const chats = pgTable(
  "chat",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdById: text("created_by").references(() => authUser.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("chat_created_by_idx").on(table.createdById)],
);

export const chatMessages = pgTable(
  "chat_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: chatRole("role").notNull().default("USER"),
    content: text("content").notNull(),
    createdById: text("created_by").references(() => authUser.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("chat_message_chat_idx").on(table.chatId)],
);

export const chatRelations = relations(chats, ({ one, many }) => ({
  createdBy: one(authUser, {
    fields: [chats.createdById],
    references: [authUser.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
  createdBy: one(authUser, {
    fields: [chatMessages.createdById],
    references: [authUser.id],
  }),
}));
