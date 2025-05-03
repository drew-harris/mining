console.log("Hello via Bun!");

Bun.serve({
  routes: {
    "/": async (req: Request) => {
      const file = Bun.file("./mine.lua");
      const text = await file.text();
      return new Response(text);
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
