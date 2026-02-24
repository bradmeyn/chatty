import { createMiddleware } from "hono/factory";
import { auth } from "../auth.js";

export type AuthContext = {
  userId: string;
};

export type AppEnv = {
  Variables: {
    authContext: AuthContext;
  };
};

export const requireAuthContext = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("authContext", {
    userId: user.id,
  });
  await next();
});
