import classNames from 'classnames';
import { useQuote } from '../store/quotesStore';

type Props = {
  symbol: string;
  isSelected?: boolean;
  onSelect?: (symbol: string) => void;
  compact?: boolean;
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

function displaySymbol(symbol: string) {
  return symbol.startsWith('BINANCE:') ? symbol.slice('BINANCE:'.length) : symbol;
}

export function QuoteCard({
  symbol,
  isSelected = false,
  onSelect,
  compact = false,
}: Props) {
  const quote = useQuote(symbol);
  const interactive = Boolean(onSelect);

  const containerClass = classNames(
    'rounded-lg border text-left shadow-sm transition-colors',
    compact ? 'p-2.5' : 'p-4',
    {
      'border-sky-500 bg-zinc-900 ring-1 ring-sky-500/40': isSelected,
      'border-zinc-700 bg-zinc-900 hover:border-zinc-500': !isSelected,
    },
  );

  const Tag = interactive ? 'button' : 'div';
  const interactiveProps = interactive
    ? {
        type: 'button' as const,
        'aria-pressed': isSelected,
        onClick: () => onSelect?.(symbol),
      }
    : {};

  if (!quote) {
    return (
      <Tag {...interactiveProps} className={classNames(containerClass, 'text-zinc-400')}>
        <div className={classNames('font-semibold', compact ? 'text-xs' : 'text-sm')}>
          {displaySymbol(symbol)}
        </div>
        <div className={classNames(compact ? 'mt-1 text-[10px]' : 'mt-2 text-xs')}>
          {compact ? 'Waiting…' : 'No data'}
        </div>
      </Tag>
    );
  }

  const isUp = (quote.dp ?? 0) >= 0;
  const changeColor = classNames('font-medium', {
    'text-emerald-400': isUp,
    'text-rose-400': !isUp,
  });

  if (compact) {
    return (
      <Tag {...interactiveProps} className={classNames(containerClass, 'text-zinc-100')}>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold tracking-wide">
            {displaySymbol(symbol)}
          </span>
          <span className={classNames('text-[10px]', changeColor)}>
            {quote.dp != null ? `${percentFormatter.format(quote.dp)}%` : '—'}
          </span>
        </div>
        <div className="mt-1 text-base font-mono tabular-nums">
          {priceFormatter.format(quote.c)}
        </div>
      </Tag>
    );
  }

  return (
    <Tag {...interactiveProps} className={classNames(containerClass, 'text-zinc-100')}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold tracking-wide">
          {displaySymbol(symbol)}
        </span>
        <span className={classNames('text-xs', changeColor)}>
          {quote.dp != null ? `${percentFormatter.format(quote.dp)}%` : '—'}
        </span>
      </div>
      <div className="mt-2 text-2xl font-mono tabular-nums">
        {priceFormatter.format(quote.c)}
      </div>
      <dl className="mt-3 hidden md:grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400">
        <dt>High</dt>
        <dd className="text-right font-mono tabular-nums text-zinc-200">
          {priceFormatter.format(quote.h)}
        </dd>
        <dt>Low</dt>
        <dd className="text-right font-mono tabular-nums text-zinc-200">
          {priceFormatter.format(quote.l)}
        </dd>
        <dt>Open</dt>
        <dd className="text-right font-mono tabular-nums text-zinc-200">
          {priceFormatter.format(quote.o)}
        </dd>
        <dt>Prev Close</dt>
        <dd className="text-right font-mono tabular-nums text-zinc-200">
          {priceFormatter.format(quote.pc)}
        </dd>
      </dl>
    </Tag>
  );
}
