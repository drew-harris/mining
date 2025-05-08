import { useState } from "react";
import type { InventoryItem } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StorageInventory {
  computer: string;
  inventory: {
    items: InventoryItem[];
    lastUpdated: string;
  } | null;
}

interface BomItem {
  name: string;
  amount: number;
}

// Fetch inventories
async function fetchInventories(): Promise<StorageInventory[]> {
  const response = await fetch("/api/storage-inventory");
  if (!response.ok) {
    throw new Error("Failed to fetch inventories");
  }
  const data = await response.json();
  return data.computers;
}

// Consolidate BOM items
async function consolidateBom(items: BomItem[]) {
  const response = await fetch("/api/bom/consolidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to consolidate BOM");
  }
  return response.json();
}

export function BomPage() {
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const queryClient = useQueryClient();

  // Query for fetching inventories
  const { data: inventories = [], isLoading: isLoadingInventories } = useQuery({
    queryKey: ["inventories"],
    queryFn: fetchInventories,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Mutation for consolidating BOM
  const consolidateMutation = useMutation({
    mutationFn: consolidateBom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
  });

  // Submit BOM for consolidation
  const handleSubmit = () => {
    if (bomItems.length === 0) return;
    consolidateMutation.mutate(bomItems);
  };

  if (isLoadingInventories) {
    return (
      <div className="p-4">
        <div className="text-center">Loading inventories...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bill of Materials</h1>

      {/* Inventory Display */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Storage Inventories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventories.map((inv) => (
            <div key={inv.computer} className="border p-4 rounded">
              <h3 className="font-semibold">{inv.computer}</h3>
              <p className="text-sm text-gray-500">
                Last updated: {inv.inventory?.lastUpdated}
              </p>
              <div className="grid grid-cols-3">
                {inv.inventory?.items.map((item) => (
                  <Item
                    item={item}
                    onClick={() => {
                      consolidateMutation.mutate([
                        { name: item.name, amount: item.count },
                      ]);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Item = (props: {
  item: InventoryItem;
  onClick: (item: InventoryItem) => void;
}) => {
  const [hasGot, setHasGot] = useState(false);

  return (
    <div
      key={props.item.name}
      className="text-sm border-neutral-200 justify-between gap-2 border p-2 flex"
    >
      <div className="flex gap-2">
        <div>{props.item.name}</div>
        <div className="text-sm opacity-40">{props.item.count}</div>
      </div>
      <button
        onClick={() => {
          props.onClick(props.item);
          setHasGot(true);
        }}
        className="hover:bg-neutral-500 p-1"
      >
        {hasGot ? "✓" : "GET"}
      </button>
    </div>
  );
};
