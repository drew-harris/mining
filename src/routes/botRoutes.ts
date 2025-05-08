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
};
