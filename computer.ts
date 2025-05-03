export class Computer {
  isTurtle: boolean = false;
  socket!: Bun.ServerWebSocket<unknown>;

  constructor(isTurtle: boolean, socket: Bun.ServerWebSocket<unknown>) {
    this.isTurtle = isTurtle;
    this.socket = socket;
  }
}
