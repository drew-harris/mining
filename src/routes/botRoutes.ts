import type { BunRequest } from "bun";

import { computers } from "../state";

export const botRoutes = {
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
  "/exec/:name/:file": async (req: BunRequest) => {
    const url = new URL(req.url);
    const name = url.pathname.split("/")[2];
    const file = url.pathname.split("/")[3];

    if (name === undefined || file === undefined) {
      return new Response("Invalid request", { status: 400 });
    }

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
};
