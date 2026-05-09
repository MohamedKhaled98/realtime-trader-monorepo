import { Redis } from "ioredis";
import { activate, addSymbol, deactivate, removeSymbol } from "./finnhub.js";
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

export async function startSymbolsListener() {
  await subscriber.subscribe("symbol", "clients");
  subscriber.on("message", (channel, raw) => {
    const msg = JSON.parse(raw);

    if (channel === "clients") {
      if (msg.event === "active") activate();
      else if (msg.event === "idle") deactivate();
    } else if (channel === "symbol") {
      if (msg.type === "subscribe") addSymbol(msg.symbol);
      else if (msg.type === "unsubscribe") removeSymbol(msg.symbol);
    }
  });
}

export { publisher, client, subscriber };
