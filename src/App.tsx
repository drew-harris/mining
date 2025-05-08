import { useQuery } from "@tanstack/react-query";
import { LuaExecutor } from "./components/LuaExecutor";
import { StorageManagement } from "./components/StorageManagement";
import { useState } from "react";

interface ActiveBotsResponse {
  count: number;
}

async function fetchActiveBots(): Promise<ActiveBotsResponse> {
  const response = await fetch("/api/active-bots");
  if (!response.ok) {
    throw new Error("Failed to fetch active bots");
  }
  return response.json() as Promise<ActiveBotsResponse>;
}

export function App() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { data, isLoading, error } = useQuery<ActiveBotsResponse>({
    queryKey: ["activeBots"],
    queryFn: fetchActiveBots,
    refetchInterval: 1000, // Refetch every second
  });

  const copyInstallScript = () => {
    navigator.clipboard.writeText("wget run https://turtle.drewh.net/install");
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#C6C6C6]">
        <div className="text-2xl font-minecraft text-[#404040] border-4 border-[#565656] bg-[#C6C6C6] p-8">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#C6C6C6]">
        <div className="text-2xl font-minecraft text-[#404040] border-4 border-[#565656] bg-[#C6C6C6] p-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C6C6C6]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <button
            onClick={copyInstallScript}
            className="absolute top-0 right-0 text-sm font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] px-4 py-2 hover:bg-[#B6B6B6] transition-colors"
          >
            Copy Install Script
          </button>
          {showConfirmation && (
            <div className="absolute top-12 right-0 text-sm font-minecraft text-[#404040] border-2 border-[#565656] bg-[#C6C6C6] px-4 py-2 animate-fade-in-out">
              Copied to clipboard!
            </div>
          )}
        </div>
        <div className="border-4 border-[#565656] bg-[#C6C6C6] p-8 mb-8">
          <h1 className="text-4xl font-minecraft text-center text-[#404040] mb-8">
            Bot Monitor
          </h1>
          <div className="border-4 border-[#565656] bg-[#C6C6C6] p-6">
            <h2 className="text-2xl font-minecraft text-center text-[#404040]">
              Active Bots: {data?.count ?? 0}
            </h2>
          </div>
        </div>

        <StorageManagement />
        <LuaExecutor />
      </div>
    </div>
  );
}
