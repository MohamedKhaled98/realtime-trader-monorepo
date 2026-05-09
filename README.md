# Realtime Trader

Real-time stock quotes app. React frontend streams live trade ticks from a Node gateway, which is fed by a separate ingestor service connected to Finnhub's WebSocket.

## Project overview

Three components, each with its own `package.json`:

- **`backend/ingestor/`** — Connects to Finnhub's WebSocket, dedupes ticks per symbol per batch, and publishes them to Redis on `trades:<SYMBOL>`.
- **`backend/gateway/`** — Public HTTP + WebSocket server (`:8080`). REST endpoints under `/v1` (tickers, search, news) plus a `/ws` endpoint that broadcasts ticks from Redis to clients.
- **`client/`** — React 19 + Vite SPA. Streams quotes over WebSocket, fetches REST data via React Query, and keeps per-symbol tick history in a Zustand store.

The two backends communicate **only** via Redis pub/sub. A local Redis at `redis://localhost:6379` is required.

### Run with Docker

```bash
docker-compose up --build
```

Brings up Redis, ingestor, gateway, and client together.

### Run locally

```bash
# Redis first (e.g. docker compose up redis), then in separate terminals:
cd backend/ingestor && npm install && npm run dev
cd backend/gateway  && npm install && npm run dev
cd client           && npm install && npm run dev
```

## Implementation notes

- **Split into microservices** so ingestor and gateway scale independently.
- **Redis cache** on `/v1/news` (5-minute TTL per category) to reduce Finnhub calls.
- **React Query** for REST data — caching, deduping, and stale-while-revalidate out of the box.
- **`useTransition`** on non-urgent UI updates (symbol switches, list re-renders) so the chart stays responsive under tick storms.
- **Debounced symbol search** to avoid firing a Finnhub request on every keystroke.
- **Per-symbol tick history capped at 500 points** in the Zustand store to bound client memory.

## Assumptions & trade-offs

- **Global WS fan-out.** Every connected client currently receives every symbol's ticks; per-socket filtering would let the gateway send symbol updates only to clients subscribed to that symbol. Not yet implemented.
