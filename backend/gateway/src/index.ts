import { createServer } from "http";
import { createApp } from "./app.js";
import { startTradeListener } from "./redis.js";
import { attachWsToHttpServer, startWsServer } from "./wsServer.js";
import { config } from "./config.js";

const app = createApp();
const server = createServer(app);

const wss = startWsServer();
attachWsToHttpServer(server, wss);

await startTradeListener(wss);

server.listen(config.PORT, () => {
  console.log(`[gateway] HTTP+WS listening on :${config.PORT}`);
  console.log(`[gateway] WS endpoint ws://localhost:${config.PORT}/ws`);
});
