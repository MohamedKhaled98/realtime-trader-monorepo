import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { fetchTickers, searchStocks } from '../api/search';
import { useDebounce } from '../hooks/useDebounce';
import { subscribeSymbol } from '../hooks/useTradesSocket';
import { useAddSubscribedSymbol } from '../store/quotesStore';

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const addSubscribedSymbol = useAddSubscribedSymbol();

  const handlePick = (symbol: string) => {
    addSubscribedSymbol(symbol);
    subscribeSymbol(symbol);
    onClose();
  };

  const tickersQuery = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    enabled: isOpen,
    staleTime: 60 * 60_000,
  });

  const searchQuery = useQuery({
    queryKey: ['stock-search', debouncedQuery],
    queryFn: () => searchStocks(debouncedQuery),
    enabled: isOpen && debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const showSearch = debouncedQuery.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search tickers"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl"
      >
        <div className="flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-zinc-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickers…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
            Esc
          </kbd>
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto">
          {showSearch ? (
            <SearchResults
              isPending={searchQuery.isPending}
              isError={searchQuery.isError}
              items={searchQuery.data?.result}
              onPick={handlePick}
            />
          ) : (
            <TopPicks
              isPending={tickersQuery.isPending}
              isError={tickersQuery.isError}
              items={tickersQuery.data?.result}
              onPick={handlePick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TopPicks({
  isPending,
  isError,
  items,
  onPick,
}: {
  isPending: boolean;
  isError: boolean;
  items?: string[];
  onPick: (symbol: string) => void;
}) {
  if (isPending) return <Hint>Loading top picks…</Hint>;
  if (isError) return <Hint tone="error">Failed to load tickers.</Hint>;
  if (!items || items.length === 0) return <Hint>No tickers available.</Hint>;

  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        Top picks
      </p>
      <ul className="space-y-1">
        {items.map((symbol) => (
          <li key={symbol}>
            <button
              type="button"
              onClick={() => onPick(symbol)}
              className="w-full rounded px-2 py-1.5 text-left text-sm text-zinc-100 hover:bg-zinc-800"
            >
              {symbol}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchResults({
  isPending,
  isError,
  items,
  onPick,
}: {
  isPending: boolean;
  isError: boolean;
  items?: { symbol: string; description: string; displaySymbol: string }[];
  onPick: (symbol: string) => void;
}) {
  if (isPending) return <Hint>Searching…</Hint>;
  if (isError) return <Hint tone="error">Search failed.</Hint>;
  if (!items || items.length === 0) return <Hint>No results.</Hint>;

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.symbol}>
          <button
            type="button"
            onClick={() => onPick(item.symbol)}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-zinc-800"
          >
            <span className="text-sm text-zinc-100">{item.displaySymbol}</span>
            <span className="ml-3 truncate text-xs text-zinc-400">
              {item.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Hint({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'error';
}) {
  return (
    <p
      className={classNames('px-2 py-2 text-xs', {
        'text-rose-400': tone === 'error',
        'text-zinc-500': tone !== 'error',
      })}
    >
      {children}
    </p>
  );
}
