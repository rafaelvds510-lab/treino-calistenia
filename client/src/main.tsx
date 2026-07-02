import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const response = await globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
        
        if (response.status === 401) {
          // If a request returns 401 Unauthorized, redirect to login page
          // but only if we're not already on a public auth route
          const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
          const isPublicRoute = publicRoutes.some((route) =>
            window.location.pathname.startsWith(route)
          );
          if (typeof window !== "undefined" && !isPublicRoute) {
            window.location.href = "/login";
          }
        }
        
        return response;
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
