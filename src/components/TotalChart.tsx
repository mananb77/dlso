import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TotalChartProps {
  scores: {
    weightedEffort: number;
    weightedSleep: number;
    weightedLeisure: number;
    total: number;
  };
}

const COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#34d399'];

export function TotalChart({ scores }: TotalChartProps) {
  const data = [
    { name: 'Effort', value: scores.weightedEffort },
    { name: 'Sleep', value: scores.weightedSleep },
    { name: 'Leisure', value: scores.weightedLeisure },
    { name: 'Total', value: scores.total },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-2">Weighted Satisfaction Breakdown</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(v: number) => [v.toFixed(2), 'Score']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={300}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
