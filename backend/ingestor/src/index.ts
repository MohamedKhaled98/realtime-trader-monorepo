import { connectFinnhub } from "./finnhub.js";
import { startSymbolsListener } from "./redis.js";

await connectFinnhub();
await startSymbolsListener();
console.log("Ingestor running");
