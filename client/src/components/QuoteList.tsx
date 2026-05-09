import { useState, useTransition } from 'react';
import { useInitialQuotes } from '../hooks/useInitialQuotes';
import {
  useQuoteSymbols,
  useSelectedSymbol,
  useSetSelectedSymbol,
  useSubscribedSymbols,
} from '../store/quotesStore';
import { QuoteCard } from './QuoteCard';
import { SearchModal } from './SearchModal';

export function QuoteList() {
  const { isPending: isInitialPending, isError, error, refetch, isFetching } =
    useInitialQuotes();
  const symbols = useQuoteSymbols();
  const subscribedSymbols = useSubscribedSymbols();
  const selectedSymbol = useSelectedSymbol();
  const setSelectedSymbol = useSetSelectedSymbol();
  const [isSwitching, startTransition] = useTransition();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSelect = (symbol: string) => {
    startTransition(() => setSelectedSymbol(symbol));
  };

  if (isInitialPending) {
    return <div className="text-zinc-400 text-sm">Loading initial quotes…</div>;
  }

  if (isError) {
    return (
      <div className="text-rose-400 text-sm">
        <div>Failed to load quotes: {error.message}</div>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded border border-zinc-600 px-3 py-1 text-zinc-200 hover:bg-zinc-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-200">Top tickers</h2>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search tickers"
            className="rounded p-1 text-emerald-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </div>
        {(isFetching || isSwitching) && (
          <span className="text-xs text-zinc-500">
            {isSwitching ? 'Switching…' : 'Refreshing…'}
          </span>
        )}
      </header>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        role="tablist"
        aria-label="Top tickers"
      >
        {symbols.map((symbol) => (
          <QuoteCard
            key={symbol}
            symbol={symbol}
            isSelected={symbol === selectedSymbol}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {subscribedSymbols.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Subscribed
          </h3>
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
            role="tablist"
            aria-label="Subscribed tickers"
          >
            {subscribedSymbols.map((symbol) => (
              <QuoteCard
                key={symbol}
                symbol={symbol}
                isSelected={symbol === selectedSymbol}
                onSelect={handleSelect}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
