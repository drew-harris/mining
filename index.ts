import { Computer } from "./computer";
import indexHtml from "./public/index.html";
import { botRoutes } from "./src/routes/botRoutes";
import { storageRoutes } from "./src/routes/storageRoutes";
import { fileRoutes } from "./src/routes/fileRoutes";
import { wsRoutes } from "./src/routes/wsRoutes";
import type { PossibleMessage } from "./src/types";
import { computers } from "./src/state";

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
          parsedMessage.name,
        );
        computers.push(computer);
        console.log("Registered computer: ", parsedMessage.name);
      }

      ws.send(message);
    },
    close(ws, code, reason) {
      const index = computers.findIndex((c) => c.socket === ws);
      if (index !== -1) {
        const removedComputer = computers.splice(index, 1)[0] as Computer;
        console.log(`Computer disconnected: ${removedComputer.name}`);
      }
    },
  },
  routes: {
    "/": indexHtml,
    ...botRoutes,
    ...storageRoutes,
    ...fileRoutes,
    ...wsRoutes,
    "/bom": indexHtml,
    "/storage": indexHtml,
  },
  development: true,
  port: 25565,
});

console.log("Server started on port 25565");
