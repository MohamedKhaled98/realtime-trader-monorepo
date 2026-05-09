import { Redis } from "ioredis";
import type { WebSocketServer } from "ws";
import { config } from "./config.js";

const publisher = new Redis(config.REDIS_URL);
const subscriber = new Redis(config.REDIS_URL);
const client = new Redis(config.REDIS_URL);

[publisher, subscriber, client].forEach((c, i) => {
  const name = ["publisher", "subscriber", "client"][i];
  c.on("error", (err) => {
    console.log(err);
    process.exit(1);
  });
  c.on("connect", () => console.log(`[redis:${name}] connected`));
});

export async function startTradeListener(wss: WebSocketServer) {
  await subscriber.psubscribe("trades:*");

  subscriber.on("pmessage", (_pattern, channel, message) => {
    for (const ws of wss.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  });
}
export function handleSymbolSubscription(type: string, symbol:string){
    publisher.publish(`symbol`, JSON.stringify({ type: type, symbol: symbol }));
}

export function publishClientsEvent(event: "active" | "idle") {
    publisher.publish("clients", JSON.stringify({ event }));
}

export { client, publisher, subscriber };
