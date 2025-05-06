import { useQuery } from "@tanstack/react-query";
import { LuaExecutor } from "./components/LuaExecutor";

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
  const { data, isLoading, error } = useQuery<ActiveBotsResponse>({
    queryKey: ["activeBots"],
    queryFn: fetchActiveBots,
    refetchInterval: 1000, // Refetch every second
  });

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

        <LuaExecutor />
      </div>
    </div>
  );
}
