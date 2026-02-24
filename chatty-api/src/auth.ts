import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";
import { authAccount, authSession, authUser, authVerification } from "./models/auth.js";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

const trustedOrigins = [
  process.env.CORS_ORIGIN,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean) as string[];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});
