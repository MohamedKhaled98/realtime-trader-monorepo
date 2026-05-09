import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchInitialQuotes } from '../api/quotes';
import { useSetInitialQuotes } from '../store/quotesStore';

export const initialQuotesQueryKey = ['quotes', 'initial'] as const;

export function useInitialQuotes() {
  const setInitialQuotes = useSetInitialQuotes();

  const query = useQuery({
    queryKey: initialQuotesQueryKey,
    queryFn: fetchInitialQuotes,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setInitialQuotes(query.data.result);
    }
  }, [query.data, setInitialQuotes]);

  return query;
}
