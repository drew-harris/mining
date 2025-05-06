export class Computer {
  isTurtle: boolean = false;
  socket!: Bun.ServerWebSocket<unknown>;
  name!: string;

  constructor(
    isTurtle: boolean,
    socket: Bun.ServerWebSocket<unknown>,
    name: string
  ) {
    this.isTurtle = isTurtle;
    this.socket = socket;
    this.name = name;
  }

  async execFile(path: string) {
    const file = Bun.file(path);
    const text = await file.text();

    this.socket.send(
      JSON.stringify({
        type: "eval",
        function: text,
      })
    );
  }

  async execWithArgs(path: string, args: any[]) {
    const file = Bun.file(path);
    const text = await file.text();

    this.socket.send(
      JSON.stringify({
        type: "eval",
        function: text,
        args,
      })
    );
  }
}
