import type { InventoryItem } from "../types";
import { computers, inventoryData } from "../state";

export const bomRoutes = {
  "/api/bom/consolidate": {
    POST: async (req: Request) => {
      try {
        const { items } = (await req.json()) as {
          items: { name: string; amount: number }[];
        };

        if (!items || !Array.isArray(items)) {
          return Response.json(
            { error: "Invalid items format" },
            { status: 400 }
          );
        }

        // Execute consolidate.lua for each item
        const results = await Promise.all(
          items.map(async ({ name, amount }) => {
            try {
              const args = [name, amount.toString()];
              await computers[0].execWithArgs("consolidate.lua", args);
              return {
                item: name,
                amount,
                status: "success",
              };
            } catch (error) {
              return {
                item: name,
                amount,
                status: "error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              };
            }
          })
        );

        return Response.json({
          message: "BOM consolidation initiated",
          results,
        });
      } catch (error) {
        console.error("Error consolidating BOM:", error);
        return Response.json(
          {
            error: "Failed to consolidate BOM",
          },
          { status: 500 }
        );
      }
    },
  },
};
