interface ScoreCardProps {
  current: number;
  optimal: number;
}

export function ScoreCard({ current, optimal }: ScoreCardProps) {
  const pct = optimal !== 0 ? (current / optimal) * 100 : 0;

  let colorClass = 'text-red-400';
  if (pct >= 90) colorClass = 'text-emerald-400';
  else if (pct >= 70) colorClass = 'text-yellow-400';
  else if (pct >= 50) colorClass = 'text-orange-400';

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Satisfaction</p>
      <p className={`text-4xl font-bold font-mono tabular-nums ${colorClass}`}>
        {current.toFixed(1)}
      </p>
      <p className="text-xs text-slate-500 mt-2">
        {pct.toFixed(0)}% of optimal ({optimal.toFixed(1)})
      </p>
    </div>
  );
}
