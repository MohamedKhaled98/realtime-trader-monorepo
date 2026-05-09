import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../api/news';

export default function NewsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['news', 'general'],
    queryFn: () => fetchNews('general'),
    staleTime: 5 * 60_000,
  });

  if (isPending) {
    return <div className="text-sm text-zinc-400">Loading news…</div>;
  }

  if (isError) {
    return (
      <div className="text-sm text-rose-400">
        <div>Failed to load news: {error.message}</div>
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
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Market news</h2>
        {isFetching && <span className="text-xs text-zinc-500">Refreshing…</span>}
      </header>
      <ul className="space-y-3">
        {data.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="h-20 w-32 flex-none rounded object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 hover:text-blue-400">
                  {item.headline}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {item.summary}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {item.source} · {new Date(item.datetime * 1000).toLocaleString()}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
