import { AuthProvider, useAuth, type AuthContextType } from "@auth/context";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@components/ui/sonner";
import "./index.css";

const queryClient = new QueryClient();

export interface RouterContext {
  auth: AuthContextType;
  queryClient: QueryClient;
}

// Create router with initial context
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined! as AuthContextType,
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

function InnerApp() {
  const auth = useAuth();

  const routerContext: RouterContext = {
    auth,
    queryClient,
  };

  return <RouterProvider router={router} context={routerContext} />;
}

function App() {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");

  // root.classList.add("dark");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
