import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StorageManagement } from "./components/StorageManagement";
import { LuaExecutor } from "./components/LuaExecutor";
import { BomPage } from "./components/BomPage";
import { App } from "./App";
import { Layout } from "./Layout";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/storage",
        element: <StorageManagement />,
      },
      {
        path: "/lua",
        element: <LuaExecutor />,
      },
      {
        path: "/bom",
        element: <BomPage />,
      },
    ],
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
});
