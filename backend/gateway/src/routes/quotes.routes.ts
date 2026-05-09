import { Router, type Request, type Response } from "express";
import axios from "axios";
import { TOP_TICKERS } from "../constants.js";
import { config } from "../config.js";

type FinnhubQuote = {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

type InitialQuote = {
  symbol: string;
  quote: FinnhubQuote | null;
  error?: string;
};


const router = Router();

router.get("/quotes/initial", async (_req: Request, res: Response) => {
  const settled = await Promise.allSettled(
    TOP_TICKERS.map((symbol) =>
      axios
        .get<FinnhubQuote>(
          `${config.FINNHUB_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${config.FINNHUB_TOKEN}`,
        )
        .then((r) => r.data),
    ),
  );

  const result: InitialQuote[] = settled.map((outcome, i) => {
    const symbol = TOP_TICKERS[i]!;
    if (outcome.status === "fulfilled") {
      return { symbol, quote: outcome.value };
    }
    return {
      symbol,
      quote: null,
      error: String(outcome.reason?.message ?? outcome.reason),
    };
  });

  res.send({ count: result.length, result });
});

export default router;
