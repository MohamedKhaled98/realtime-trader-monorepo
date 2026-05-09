export type Quote = {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

export type InitialQuote = {
  symbol: string;
  quote: Quote | null;
  error?: string;
};

export type InitialQuotesResponse = {
  count: number;
  result: InitialQuote[];
};
