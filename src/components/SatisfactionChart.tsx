import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import type { CurvePoint } from '../model/polynomials';

interface SatisfactionChartProps {
  label: string;
  data: CurvePoint[];
  currentValue: number;
  optimalValue: number;
  color: string;
  currentSatisfaction: number;
}

export function SatisfactionChart({
  label,
  data,
  currentValue,
  optimalValue,
  color,
  currentSatisfaction,
}: SatisfactionChartProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-2">{label} Satisfaction</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="hours"
            type="number"
            domain={[0, 24]}
            ticks={[0, 4, 8, 12, 16, 20, 24]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            label={{ value: 'Hours', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelFormatter={(v) => `${v}h`}
            formatter={(v: number) => [v.toFixed(2), 'Satisfaction']}
          />
          <Line
            type="monotone"
            dataKey="satisfaction"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
          <ReferenceLine
            x={optimalValue}
            stroke="#34d399"
            strokeDasharray="5 5"
            label={{
              value: `Optimal ${optimalValue}h`,
              position: 'top',
              fontSize: 10,
              fill: '#34d399',
            }}
          />
          <ReferenceDot
            x={currentValue}
            y={currentSatisfaction}
            r={5}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
