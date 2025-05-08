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
  const [currentItem, setCurrentItem] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
      setBomItems([]);
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
  });

  // Get all unique item names from inventories
  const getAllItems = (): string[] => {
    const items = new Set<string>();
    inventories.forEach((inv) => {
      inv.inventory?.items.forEach((item) => {
        items.add(item.name);
      });
    });
    return Array.from(items).sort();
  };

  // Handle item input changes
  const handleItemInput = (value: string) => {
    setCurrentItem(value);
    const allItems = getAllItems();
    const filtered = allItems.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  };

  // Handle item selection
  const handleItemSelect = (item: string) => {
    setCurrentItem(item);
    setSuggestions([]);
  };

  // Handle amount input
  const handleAmountInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentItem && currentAmount) {
      const amount = parseInt(currentAmount);
      if (!isNaN(amount) && amount > 0) {
        setBomItems([...bomItems, { name: currentItem, amount }]);
        setCurrentItem("");
        setCurrentAmount("");
      }
    }
  };

  // Remove item from BOM
  const removeBomItem = (index: number) => {
    setBomItems(bomItems.filter((_, i) => i !== index));
  };

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
              <div className="mt-2">
                {inv.inventory?.items.map((item) => (
                  <div key={item.name} className="text-sm">
                    {item.name}: {item.count}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOM Creation */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create BOM</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={currentItem}
              onChange={(e) => handleItemInput(e.target.value)}
              placeholder="Enter item name..."
              className="w-full p-2 border rounded"
            />
            {suggestions.length > 0 && (
              <div className="absolute bg-white border rounded mt-1 w-full">
                {suggestions.map((item) => (
                  <div
                    key={item}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleItemSelect(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            onKeyDown={handleAmountInput}
            placeholder="Amount"
            className="w-24 p-2 border rounded"
          />
        </div>

        {/* BOM Items List */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Current BOM Items</h3>
          {bomItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>
                {item.name} x {item.amount}
              </span>
              <button
                onClick={() => removeBomItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          {bomItems.length === 0 && (
            <p className="text-gray-500">No items added yet</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={bomItems.length === 0 || consolidateMutation.isPending}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {consolidateMutation.isPending
            ? "Processing..."
            : "Consolidate Items"}
        </button>

        {consolidateMutation.isError && (
          <div className="mt-2 text-red-500">
            Error: {consolidateMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
