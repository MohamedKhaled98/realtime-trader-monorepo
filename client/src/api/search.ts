import { apiClient } from './client';
import type { SearchResponse, TickersResponse } from '../types/search';

export async function fetchTickers(): Promise<TickersResponse> {
  const { data } = await apiClient.get<TickersResponse>('/tickers');
  return data;
}

export async function searchStocks(q: string): Promise<SearchResponse> {
  const { data } = await apiClient.get<SearchResponse>('/stock/search', {
    params: { q },
  });
  return data;
}
