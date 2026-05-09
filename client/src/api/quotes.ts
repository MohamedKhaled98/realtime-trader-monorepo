import { apiClient } from './client';
import type { InitialQuotesResponse } from '../types/quote';

export async function fetchInitialQuotes(): Promise<InitialQuotesResponse> {
  const { data } = await apiClient.get<InitialQuotesResponse>('/quotes/initial');
  return data;
}
