import { useEffect, useRef } from 'react';
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useQuotesStore, useSelectedSymbol } from '../store/quotesStore';

const CHART_OPTIONS = {
  autoSize: true,
  layout: {
    background: { color: '#09090b' },
    textColor: '#d4d4d8',
  },
  grid: {
    vertLines: { color: '#1f1f23' },
    horzLines: { color: '#1f1f23' },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
    borderColor: '#3f3f46',
  },
  rightPriceScale: { borderColor: '#3f3f46' },
  crosshair: { mode: 1 as const },
} as const;

const SERIES_OPTIONS = {
  color: '#60a5fa',
  lineWidth: 2 as const,
  priceLineVisible: true,
  lastValueVisible: true,
};

function displaySymbol(symbol: string) {
  return symbol.startsWith('BINANCE:') ? symbol.slice('BINANCE:'.length) : symbol;
}

export function Chart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const selectedSymbol = useSelectedSymbol();

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, CHART_OPTIONS);
    const series = chart.addSeries(LineSeries, SERIES_OPTIONS);
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || !selectedSymbol) return;

    const initial =
      useQuotesStore.getState().tickHistory[selectedSymbol] ?? [];
    series.setData(
      initial.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })),
    );
    if (initial.length > 0) chart.timeScale().fitContent();

    let lastTime = initial[initial.length - 1]?.time;
    let lastValue = initial[initial.length - 1]?.value;

    const unsubscribe = useQuotesStore.subscribe((state) => {
      const hist = state.tickHistory[selectedSymbol];
      if (!hist || hist.length === 0) return;
      const point = hist[hist.length - 1];
      if (lastTime === undefined || point.time > lastTime) {
        series.update({ time: point.time as UTCTimestamp, value: point.value });
        lastTime = point.time;
        lastValue = point.value;
      } else if (point.time === lastTime && point.value !== lastValue) {
        series.update({ time: point.time as UTCTimestamp, value: point.value });
        lastValue = point.value;
      }
    });

    return () => unsubscribe();
  }, [selectedSymbol]);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">
          {selectedSymbol ? displaySymbol(selectedSymbol) : '—'}
        </h2>
        <span className="text-xs text-zinc-500">live</span>
      </header>
      <div ref={containerRef} className="h-80 w-full" />
    </section>
  );
}
