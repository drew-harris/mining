import type { InventoryItem } from "../types";
import { computers, inventoryData } from "../state";

export const storageRoutes = {
  "/scan": async (req: Request) => {
    const text = await req.text();
    const parsed = JSON.parse(text) as {
      computer: string;
      items: InventoryItem[];
    };

    if (!parsed.computer) {
      return Response.json(
        { error: "Computer name not provided" },
        { status: 400 }
      );
    }

    // Store the inventory data
    inventoryData.set(parsed.computer, {
      computer: parsed.computer,
      lastUpdated: new Date().toISOString(),
      items: parsed.items,
    });

    console.log(`Updated inventory for ${parsed.computer}:`, parsed.items);
    return Response.json({ success: true });
  },
  "/api/scan-storage": {
    POST: async () => {
      try {
        // Filter computers that have "storage" in their name
        const storageComputers = computers.filter((c) =>
          c.name.toLowerCase().includes("storage")
        );

        if (storageComputers.length === 0) {
          return Response.json(
            {
              error: "No storage computers found",
            },
            { status: 404 }
          );
        }

        // Execute scan.lua on all storage computers
        const results = await Promise.all(
          storageComputers.map(async (computer) => {
            try {
              await computer.execFile("scan.lua");
              return {
                computer: computer.name,
                status: "success",
              };
            } catch (error) {
              return {
                computer: computer.name,
                status: "error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              };
            }
          })
        );

        return Response.json({
          message: `Scan initiated on ${storageComputers.length} storage computers`,
          results,
        });
      } catch (error) {
        console.error("Error scanning storage computers:", error);
        return Response.json(
          {
            error: "Failed to scan storage computers",
          },
          { status: 500 }
        );
      }
    },
  },
  "/api/storage-inventory": {
    GET: (): Response => {
      try {
        // Get all storage computers
        const storageComputers = computers.filter((c) =>
          c.name.toLowerCase().includes("storage")
        );

        // Get inventory data for each storage computer
        const inventoryResults = storageComputers.map((computer) => ({
          computer: computer.name,
          inventory: inventoryData.get(computer.name) || null,
        }));

        return Response.json({
          computers: inventoryResults,
        });
      } catch (error) {
        console.error("Error getting storage inventory:", error);
        return Response.json(
          {
            error: "Failed to get storage inventory",
          },
          { status: 500 }
        );
      }
    },
  },
};
