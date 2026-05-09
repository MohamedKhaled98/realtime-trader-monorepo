export type TickersResponse = {
  count: number;
  result: string[];
};

export type SearchResultItem = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

export type SearchResponse = {
  count: number;
  result: SearchResultItem[];
};
