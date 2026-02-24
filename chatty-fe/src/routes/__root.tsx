import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { type RouterContext } from "../main"; // Import from main.tsx

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});