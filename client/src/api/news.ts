import { apiClient } from './client';
import type { NewsItem } from '../types/news';

export async function fetchNews(category = 'general'): Promise<NewsItem[]> {
  const { data } = await apiClient.get<NewsItem[]>('/news', {
    params: { category },
  });
  return data;
}
