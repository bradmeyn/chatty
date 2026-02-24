import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "ADVISOR",
  "PARA_PLANNER",
  "ADMIN_STAFF",
  "COMPLIANCE",
]);

// Better Auth schema: user
export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRole("role").notNull().default("ADVISOR"),
  phone: varchar("phone", { length: 50 }),
  isStaff: boolean("is_staff").notNull().default(false),
  isSuperuser: boolean("is_superuser").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Better Auth schema: session
export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Better Auth schema: account
export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Better Auth schema: verification
export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const authSessionRelations = relations(authSession, ({ one }) => ({
  user: one(authUser, {
    fields: [authSession.userId],
    references: [authUser.id],
  }),
}));

export const authAccountRelations = relations(authAccount, ({ one }) => ({
  user: one(authUser, {
    fields: [authAccount.userId],
    references: [authUser.id],
  }),
}));
