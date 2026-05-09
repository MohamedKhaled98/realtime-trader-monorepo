import { WebSocketServer, type WebSocket } from "ws";
import { type Server } from "http";
import { authenticateUpgrade } from "./auth/middleware.js";
import { handleSymbolSubscription, publishClientsEvent } from "./redis.js";


function _onMessage(ws: WebSocket, raw: WebSocket.RawData) {
  const { type, symbol } = JSON.parse(raw.toString());

  if (!["subscribe", "unsubscribe"].includes(type) || !symbol) {
    ws.send(JSON.stringify({ msg: "Malformed message", type: "error" }));
  } else {
    handleSymbolSubscription(type, symbol);
  }
}

export function startWsServer() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    console.log(`[wsServer] client connected, clients.size=${wss.clients.size}`);
    if (wss.clients.size === 1) publishClientsEvent("active");
    ws.on("message", (raw) => _onMessage(ws, raw));
    ws.on("close", () => {
      console.log(`[wsServer] client closed, clients.size=${wss.clients.size}`);
      if (wss.clients.size === 0) publishClientsEvent("idle");
    });
  });

  wss.on("close", () => {
    console.log("[wsServer]: Closed ");
  });

  wss.on("error", (err) => {
    console.log("[wsServer]: Error ", err);
  });

  return wss;
}



export function attachWsToHttpServer(server: Server, wss: WebSocketServer) {
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "", "http://localhost");
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }
    const user = authenticateUpgrade(req);
    if (!user) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
}
