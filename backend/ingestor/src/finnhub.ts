import WebSocket from "ws";
import { publisher } from "./redis.js";
import { config } from "./config.js";

const DEFAULT_SYMBOLS = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "AAPL", "AMZN"];

let activeSymbols = new Set<string>(DEFAULT_SYMBOLS);
let clientsActive = false;
let finnhub: WebSocket;

function send(type: "subscribe" | "unsubscribe", symbol: string) {
  console.log(`[finnhub] send(${type}, ${symbol}) readyState=${finnhub?.readyState}`);
  if (finnhub.readyState === WebSocket.OPEN) {
    finnhub.send(JSON.stringify({ type, symbol }));
  }
}

export function addSymbol(symbol: string) {
  if (activeSymbols.has(symbol)) return;
  activeSymbols.add(symbol);
  if (clientsActive) send("subscribe", symbol);
}

export function removeSymbol(symbol: string) {
  if (!activeSymbols.delete(symbol)) return;
  if (clientsActive) send("unsubscribe", symbol);
}

export function activate() {
  console.log(`[finnhub] activate() called, current clientsActive=${clientsActive}, symbols=${[...activeSymbols].join(",")}`);
  if (clientsActive) return;
  clientsActive = true;
  for (const s of activeSymbols) send("subscribe", s);
}

export function deactivate() {
  if (!clientsActive) return;
  clientsActive = false;
  for (const s of activeSymbols) send("unsubscribe", s);
  activeSymbols = new Set(DEFAULT_SYMBOLS);
}

export async function connectFinnhub() {
  finnhub = new WebSocket(
    `${config.FINNHUB_WS_URL}?token=${config.FINNHUB_TOKEN}`,
  );

  finnhub.on("open", () => {
    console.log("[finnhub] connected");
    if (clientsActive) {
      for (const s of activeSymbols) send("subscribe", s);
    }
  });

  finnhub.on("message", _onMessage);

  finnhub.on("error", (error) => {
    console.error("Error:", error);
  });

  return finnhub;
}

function _onMessage(raw: string) {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (msg.type !== "trade" || !Array.isArray(msg.data)) return;

  // Finnhub batches trades. Keep only the latest tick per symbol per batch.
  const latest = new Map();
  for (const t of msg.data) {
    latest.set(t.s, { symbol: t.s, price: t.p, volume: t.v, ts: t.t });
  }

  for (const [symbol, tick] of latest) {
    publisher.publish(`trades:${symbol}`, JSON.stringify(tick));
  }
}
