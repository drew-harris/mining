import { Computer } from "./computer";
import indexHtml from "./public/index.html";
import { readdir } from "fs/promises";
import { join } from "path";

type PossibleMessage =
  | {
      type: "opening";
      name: string;
      isTurtle: boolean;
    }
  | {
      type: "eval";
      function: string;
    };

const computers: Computer[] = [];

Bun.serve({
  websocket: {
    async message(ws, message) {
      if (typeof message != "string") {
        throw new Error("Non String message passed");
      }
      const parsedMessage = (await JSON.parse(message)) as PossibleMessage;

      if (parsedMessage.type === "opening") {
        const computer = new Computer(
          parsedMessage.isTurtle,
          ws,
          parsedMessage.name
        );
        computers.push(computer);
        console.log("Registered computer: ", parsedMessage.name);
      }

      ws.send(message);
    },
    close(ws, code, reason) {
      const index = computers.findIndex((c) => c.socket === ws);
      if (index !== -1) {
        computers.splice(index, 1);
      }
    },
  },
  routes: {
    "/": indexHtml,
    "/robots": async (req: Request) => {
      return new Response(
        JSON.stringify({
          count: computers.length,
          bots: computers.map((c) => c.name),
        })
      );
    },
    "/api/active-bots": {
      GET: () => {
        return Response.json({ count: computers.length });
      },
    },
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
    "/exec/:name/:file": async (req) => {
      const name = req.params.name;
      const file = req.params.file;
      let active = [];
      if (name === "all") {
        active = computers;
      } else {
        active = computers.filter((c) => c.name.includes(name));
      }

      for (const c of active) {
        await c.execFile(file);
      }

      return new Response("ok");
    },

    "/test": async () => {
      computers.forEach((c) => c.execWithArgs("./args.lua", ["hello"]));
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
    "/ws/:name": async (req, server) => {
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
    },
    "/log": async (req: Request) => {
      console.log(
        new Date().toLocaleTimeString() + "  -  " + (await req.text())
      );
      return new Response("ok");
    },
    "/scan": async (req) => {
      const text = await req.text();
      const parsed = JSON.parse(text);
      console.log(parsed);
      return new Response("ok");
    },
  },
  development: true,
  port: 25565,
});

console.log("Server started on port 25565");
