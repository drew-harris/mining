import { readdir } from "fs/promises";

export const fileRoutes = {
  "/api/lua-files": {
    GET: async () => {
      try {
        const files = await readdir(".");
        const luaFiles = files.filter((file) => file.endsWith(".lua"));
        return Response.json({ files: luaFiles });
      } catch (error) {
        console.error("Error reading Lua files:", error);
        return Response.json({ files: [] }, { status: 500 });
      }
    },
  },
  "/startup": async (req: Request) => {
    const file = Bun.file("./startup.lua");
    const text = await file.text();
    return new Response(text);
  },
  "/install": async (req: Request) => {
    const file = Bun.file("./install.lua");
    const text = await file.text();
    return new Response(text);
  },
};
