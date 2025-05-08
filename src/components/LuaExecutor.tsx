import { useState } from "react";
import type { ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";

interface Bot {
  name: string;
}

interface LuaFile {
  name: string;
}

interface RobotsResponse {
  count: number;
  bots: string[];
}

interface LuaFilesResponse {
  files: string[];
}

async function fetchBots(): Promise<Bot[]> {
  const response = await fetch("/robots");
  if (!response.ok) throw new Error("Failed to fetch bots");
  const data = (await response.json()) as RobotsResponse;
  return data.bots.map((name: string) => ({ name }));
}

async function fetchLuaFiles(): Promise<LuaFile[]> {
  const response = await fetch("/api/lua-files");
  if (!response.ok) throw new Error("Failed to fetch Lua files");
  const data = (await response.json()) as LuaFilesResponse;
  return data.files.map((name) => ({ name }));
}

export function LuaExecutor() {
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string>("");

  const { data: bots = [] } = useQuery({
    queryKey: ["bots"],
    queryFn: fetchBots,
    refetchInterval: 1000,
  });

  const { data: luaFiles = [] } = useQuery({
    queryKey: ["luaFiles"],
    queryFn: fetchLuaFiles,
  });

  const handleBotSelection = (botName: string) => {
    setSelectedBots((prev) =>
      prev.includes(botName)
        ? prev.filter((name) => name !== botName)
        : [...prev, botName],
    );
  };

  const executeLua = async () => {
    if (!selectedFile || selectedBots.length === 0) return;

    setIsExecuting(true);
    setExecutionStatus("Executing...");

    try {
      for (const bot of selectedBots) {
        const response = await fetch(`/exec/${bot}/${selectedFile}`);
        if (!response.ok) {
          throw new Error(`Failed to execute on ${bot}`);
        }
      }
      setExecutionStatus("Execution completed successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setExecutionStatus(`Error: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#C6C6C6] border-4 border-[#565656]">
      <h2 className="text-3xl font-minecraft text-center text-[#404040] mb-8">
        Lua File Executor
      </h2>

      {/* Bot Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-minecraft text-[#404040] mb-4">
          Select Bots
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {bots.map((bot) => (
            <button
              key={bot.name}
              onClick={() => handleBotSelection(bot.name)}
              className={`minecraft-button ${
                selectedBots.includes(bot.name)
                  ? "bg-[#999999] border-[#404040]"
                  : "bg-[#C6C6C6] border-[#565656] hover:bg-[#999999]"
              }`}
            >
              {bot.name}
            </button>
          ))}
        </div>
      </div>

      {/* File Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-minecraft text-[#404040] mb-4">
          Select Lua File
        </h3>
        <select
          value={selectedFile}
          onChange={(e) => {
            const select = e.target as HTMLSelectElement;
            setSelectedFile(select.value);
          }}
          className="w-full p-3 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft text-[#404040]"
        >
          <option value="">Select a file...</option>
          {luaFiles.map((file) => (
            <option key={file.name} value={file.name}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      {/* Execute Button */}
      <button
        onClick={executeLua}
        disabled={isExecuting || !selectedFile || selectedBots.length === 0}
        className={`w-full minecraft-button ${
          isExecuting || !selectedFile || selectedBots.length === 0
            ? "bg-[#999999] border-[#404040] cursor-not-allowed"
            : "bg-[#C6C6C6] border-[#565656] hover:bg-[#999999]"
        }`}
      >
        {isExecuting ? "Executing..." : "Execute Lua File"}
      </button>

      {/* Status Message */}
      {executionStatus && (
        <div className="mt-4 p-4 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft text-[#404040]">
          {executionStatus}
        </div>
      )}
    </div>
  );
}
