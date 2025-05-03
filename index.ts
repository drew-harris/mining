import { Computer } from "./computer";

console.log("Hello via Bun!");

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
    open(w) {
      console.log("open", w);
      w.sendText(
        JSON.stringify({
          type: "eval",
          function: 'return print("hello")',
        }),
      );
    },
    async message(ws, message) {
      if (typeof message != "string") {
        throw new Error("Non String message passed");
      }
      const parsedMessage = (await JSON.parse(message)) as PossibleMessage;

      if (parsedMessage.type === "opening") {
        const computer = new Computer(parsedMessage.isTurtle, ws);
        computers.push(computer);
      }

      ws.send(message);
    },
    close(ws, code, reason) {},
  },
  routes: {
    "/": async (req: Request) => {
      const file = Bun.file("./mine.lua");
      const text = await file.text();
      return new Response(text);
    },
    "/s": async (req: Request) => {
      const file = Bun.file("./storage.lua");
      const text = await file.text();
      return new Response(text);
    },
    "/ws/:name": async (req, server) => {
      console.log(req.params.name);
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
    },
    "/status": async (req: Request) => {
      console.log(
        new Date().toLocaleTimeString() + "  -  " + (await req.text()),
      );
      return new Response("ok");
    },
  },
  port: 25565,
});
