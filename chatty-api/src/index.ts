import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth.js";
import { chatsRouter } from "./routes/chats.js";

const app = new Hono();
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(
  "/api/*",
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/chats", chatsRouter);

app.get("/brad", (c) => {
  return c.text("Hello Brad!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
