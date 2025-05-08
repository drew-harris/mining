import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface InventoryItem {
  chest: string;
  count: number;
  name: string;
}

interface ComputerInventory {
  computer: string;
  lastUpdated: string;
  items: InventoryItem[];
}

interface InventoryResponse {
  computers: Array<{
    computer: string;
    inventory: ComputerInventory | null;
  }>;
}

interface ScanResponse {
  message: string;
  results: Array<{
    computer: string;
    status: "success" | "error";
    message?: string;
  }>;
}

export function StorageManagement() {
  const [expandedComputers, setExpandedComputers] = useState<Set<string>>(
    new Set(),
  );
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading: isLoadingInventory } =
    useQuery<InventoryResponse>({
      queryKey: ["storageInventory"],
      queryFn: async () => {
        const response = await fetch("/api/storage-inventory");
        if (!response.ok) {
          throw new Error("Failed to fetch storage inventory");
        }
        return response.json();
      },
      refetchInterval: 5000, // Refetch every 5 seconds
    });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/scan-storage", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scan storage computers");
      }
      return response.json() as Promise<ScanResponse>;
    },
    onSuccess: () => {
      // Invalidate and refetch inventory data
      queryClient.invalidateQueries({ queryKey: ["storageInventory"] });
    },
  });

  const toggleComputer = (computerName: string) => {
    setExpandedComputers((prev) => {
      const next = new Set(prev);
      if (next.has(computerName)) {
        next.delete(computerName);
      } else {
        next.add(computerName);
      }
      return next;
    });
  };

  const formatItemName = (name: string) => {
    // Convert minecraft:item_name to Item Name
    return name
      .replace("minecraft:", "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="border-4 border-[#565656] bg-[#C6C6C6] p-8 mb-8">
      <h2 className="text-2xl font-minecraft text-center text-[#404040] mb-4">
        Storage Management
      </h2>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] px-4 py-2 hover:bg-[#B6B6B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanMutation.isPending ? "Updating..." : "Update Storage"}
        </button>
        {scanMutation.isError && (
          <div className="w-full font-minecraft text-red-600 border-2 border-[#565656] bg-[#C6C6C6] p-4">
            {scanMutation.error.message}
          </div>
        )}
        {isLoadingInventory ? (
          <div className="w-full font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] p-4 text-center">
            Loading inventory...
          </div>
        ) : inventoryData?.computers.length === 0 ? (
          <div className="w-full font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] p-4 text-center">
            No storage computers found
          </div>
        ) : (
          <div className="w-full font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] p-4">
            <div className="space-y-4">
              {inventoryData?.computers.map(({ computer, inventory }) => {
                const isExpanded = expandedComputers.has(computer);
                const scanStatus = scanMutation.data?.results.find(
                  (r) => r.computer === computer,
                );

                return (
                  <div
                    key={computer}
                    className="border-2 border-[#565656] bg-[#C6C6C6]"
                  >
                    <button
                      onClick={() => toggleComputer(computer)}
                      className="w-full p-2 flex items-center justify-between hover:bg-[#B6B6B6] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{computer}</span>
                        {scanStatus && (
                          <span
                            className={
                              scanStatus.status === "success"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {scanStatus.status === "success" ? "✓" : "✗"}
                          </span>
                        )}
                        {scanStatus?.message && (
                          <span className="text-red-600">
                            ({scanStatus.message})
                          </span>
                        )}
                      </div>
                      <span className="text-sm">
                        {inventory
                          ? `Last updated: ${new Date(
                              inventory.lastUpdated,
                            ).toLocaleString()}`
                          : "No inventory data"}
                      </span>
                    </button>
                    {isExpanded && inventory && (
                      <div className="p-4 border-t-2 border-[#565656]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {inventory.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 border border-[#565656]"
                            >
                              <span className="font-bold">
                                {formatItemName(item.name)}
                              </span>
                              <span className="text-gray-600">
                                x{item.count}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({item.chest})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
