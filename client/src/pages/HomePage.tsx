import { Chart } from '../components/Chart';
import { QuoteList } from '../components/QuoteList';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <QuoteList />
      <Chart />
    </div>
  );
}
