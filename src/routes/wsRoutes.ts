import type { PossibleMessage } from "../types";

export const wsRoutes = {
  "/ws/:name": async (req: Request, server: any) => {
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
  },
  "/log": async (req: Request) => {
    console.log(new Date().toLocaleTimeString() + "  -  " + (await req.text()));
    return new Response("ok");
  },
};
