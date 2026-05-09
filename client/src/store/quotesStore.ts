import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Quote } from '../types/quote';

export type HistoryPoint = { time: number; value: number };

const MAX_HISTORY = 500;

type QuotesState = {
  symbols: string[];
  subscribedSymbols: string[];
  quotes: Record<string, Quote | undefined>;
  tickHistory: Record<string, HistoryPoint[] | undefined>;
  selectedSymbol: string | null;
  setInitialQuotes: (entries: Array<{ symbol: string; quote: Quote | null }>) => void;
  applyTick: (symbol: string, price: number, ts: number) => void;
  setSelectedSymbol: (symbol: string) => void;
  addSubscribedSymbol: (symbol: string) => void;
};

export const useQuotesStore = create<QuotesState>((set) => ({
  symbols: [],
  subscribedSymbols: [],
  quotes: {},
  tickHistory: {},
  selectedSymbol: null,
  setInitialQuotes: (entries) =>
    set((state) => {
      const symbols: string[] = [];
      const quotes: Record<string, Quote | undefined> = {};
      const tickHistory: Record<string, HistoryPoint[] | undefined> = {
        ...state.tickHistory,
      };
      const nowSec = Math.floor(Date.now() / 1000);
      for (const { symbol, quote } of entries) {
        symbols.push(symbol);
        if (!quote) continue;
        quotes[symbol] = quote;
        const existing = tickHistory[symbol];
        if (!existing || existing.length === 0) {
          const seedTime = quote.t > 0 ? quote.t : nowSec;
          tickHistory[symbol] = [{ time: seedTime, value: quote.c }];
        }
      }
      return {
        symbols,
        quotes,
        tickHistory,
        selectedSymbol: state.selectedSymbol ?? symbols[0] ?? null,
      };
    }),
  applyTick: (symbol, price, ts) =>
    set((state) => {
      const existing = state.quotes[symbol];
      if (!existing) {
        if (!state.subscribedSymbols.includes(symbol)) return state;
        const time = Math.floor(ts / 1000);
        const seeded: Quote = {
          c: price,
          d: 0,
          dp: 0,
          h: price,
          l: price,
          o: price,
          pc: price,
          t: ts,
        };
        return {
          quotes: { ...state.quotes, [symbol]: seeded },
          tickHistory: {
            ...state.tickHistory,
            [symbol]: [{ time, value: price }],
          },
        };
      }
      const c = price;
      const d = c - existing.pc;
      const dp = existing.pc !== 0 ? (d / existing.pc) * 100 : null;
      const h = Math.max(existing.h, c);
      const l = existing.l > 0 ? Math.min(existing.l, c) : c;

      const time = Math.floor(ts / 1000);
      const history = state.tickHistory[symbol] ?? [];
      const last = history[history.length - 1];
      let nextHistory: HistoryPoint[];
      if (last && last.time > time) {
        nextHistory = history;
      } else if (last && last.time === time) {
        nextHistory = history.slice(0, -1);
        nextHistory.push({ time, value: c });
      } else {
        nextHistory =
          history.length >= MAX_HISTORY ? history.slice(1) : history.slice();
        nextHistory.push({ time, value: c });
      }

      return {
        quotes: {
          ...state.quotes,
          [symbol]: { ...existing, c, t: ts, d, dp, h, l },
        },
        tickHistory: { ...state.tickHistory, [symbol]: nextHistory },
      };
    }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  addSubscribedSymbol: (symbol) =>
    set((state) =>
      state.symbols.includes(symbol) ||
      state.subscribedSymbols.includes(symbol)
        ? state
        : { subscribedSymbols: [...state.subscribedSymbols, symbol] },
    ),
}));

export const useQuoteSymbols = () =>
  useQuotesStore(useShallow((s) => s.symbols));

export const useQuote = (symbol: string) =>
  useQuotesStore((s) => s.quotes[symbol]);

export const useSetInitialQuotes = () =>
  useQuotesStore((s) => s.setInitialQuotes);

export const useSelectedSymbol = () =>
  useQuotesStore((s) => s.selectedSymbol);

export const useSetSelectedSymbol = () =>
  useQuotesStore((s) => s.setSelectedSymbol);

export const useSubscribedSymbols = () =>
  useQuotesStore(useShallow((s) => s.subscribedSymbols));

export const useAddSubscribedSymbol = () =>
  useQuotesStore((s) => s.addSubscribedSymbol);
