import "@/i18n";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Providers } from "./components/providers";

// Ensure React is available globally for TanStack Router
if (typeof window !== "undefined") {
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
}

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  // Add error boundary for React 19
  const App = () => {
    return (
      <StrictMode>
        <Providers>
          <RouterProvider router={router} />
          <Analytics />
        </Providers>
      </StrictMode>
    );
  };

  root.render(<App />);
}
