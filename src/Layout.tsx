import { useState, type ReactNode } from "react";
import { Link, Outlet } from "react-router";

export const Layout = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const copyInstallScript = () => {
    navigator.clipboard.writeText("wget run https://turtle.drewh.net/install");
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };
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
        <div>
          <div className="flex gap-4 mb-8">
            <Link
              to="/"
              className={`px-4 py-2 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft`}
            >
              Monitor
            </Link>
            <Link
              to="/storage"
              className={`px-4 py-2 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft`}
            >
              Storage
            </Link>
            <Link
              to="/lua"
              className={`px-4 py-2 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft`}
            >
              Lua
            </Link>
            <Link
              to="/bom"
              className={`px-4 py-2 border-2 border-[#565656] bg-[#C6C6C6] font-minecraft`}
            >
              BOM
            </Link>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
