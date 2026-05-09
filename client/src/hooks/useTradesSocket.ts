import { useEffect } from 'react';
import { getAuthToken, useAuthUser } from '../store/authStore';
import { useQuotesStore } from '../store/quotesStore';

type TradeTick = {
  symbol: string;
  price: number;
  volume: number;
  ts: number;
};

function isTradeTick(x: unknown): x is TradeTick {
  if (typeof x !== 'object' || x === null) return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.symbol === 'string' &&
    typeof t.price === 'number' &&
    typeof t.ts === 'number'
  );
}

function buildWsUrl(): string {
  const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
  const base = fromEnv
    ? fromEnv
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  const token = getAuthToken();
  if (!token) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

let socket: WebSocket | null = null;
const desiredSubs = new Set<string>();

function flushSubs() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  for (const sym of desiredSubs) {
    socket.send(JSON.stringify({ type: 'subscribe', symbol: sym }));
  }
}

export function subscribeSymbol(symbol: string) {
  if (desiredSubs.has(symbol)) return;
  desiredSubs.add(symbol);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'subscribe', symbol }));
  }
}

export function useTradesSocket() {
  const user = useAuthUser();
  useEffect(() => {
    if (!user) return;
    const applyTick = useQuotesStore.getState().applyTick;

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      const ws = new WebSocket(buildWsUrl());
      socket = ws;

      ws.onopen = () => {
        flushSubs();
      };

      ws.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
          if (isTradeTick(parsed)) {
            applyTick(parsed.symbol, parsed.price, parsed.ts);
          }
        } catch {
          return;
        }

      };

      ws.onclose = () => {
        if (socket === ws) socket = null;
        if (closed) return;
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      socket = null;
    };
  }, [user]);
}
